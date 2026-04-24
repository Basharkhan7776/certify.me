import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "./db";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";
import type { NextAuthOptions } from "next-auth";

let adapterInstance: ReturnType<typeof MongoDBAdapter> | undefined;

async function getAdapter() {
  if (!adapterInstance) {
    const client = await getMongoClient();
    adapterInstance = MongoDBAdapter(client);
  }
  return adapterInstance;
}

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const admin = await Admin.findOne({ email: credentials.email.toLowerCase() });
        if (!admin) return null;
        const valid = await admin.comparePassword(credentials.password);
        if (!valid) return null;
        return {
          id: admin._id.toString(),
          email: admin.email,
          role: "admin",
        };
      },
    }),
  ],
  adapter: await getAdapter(),
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existing = await User.findOne({ email: user.email });
        if (existing) {
          if (!existing.oauthProvider) {
            existing.oauthProvider = account.provider;
            existing.oauthId = account.providerAccountId;
            await existing.save();
          }
        }
      }
      return true;
    },
    async session({ session, user, token }) {
      if (session.user) {
        if (token.role === "admin") {
          (session.user as any).role = "admin";
        } else {
          const dbUser = await User.findById(user.id);
          if (dbUser) {
            (session.user as any).walletAddr = dbUser.walletAddr;
            (session.user as any).blocked = dbUser.blocked;
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if ((user as any)?.role === "admin") {
        token.role = "admin";
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth",
  },
  secret: process.env.AUTH_SECRET,
};
