import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./db";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";
import { Org } from "@/models/Org";
import type { NextAuthOptions } from "next-auth";

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
        await connectDB();
        if (!credentials?.email || !credentials?.password) return null;
        const admin = await Admin.findOne({
          email: credentials.email.toLowerCase(),
        });
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

  // ✅ No adapter
  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB(); // ✅
      if (account?.provider === "google" && user.email) {
        let existing = await User.findOne({ email: user.email.toLowerCase() });
        if (!existing) {
          existing = await User.create({
            name: user.name || profile?.name || "",
            email: user.email.toLowerCase(),
            oauthProvider: account.provider,
            oauthId: account.providerAccountId,
            blocked: false,
          });
        } else if (!existing.oauthProvider) {
          existing.oauthProvider = account.provider;
          existing.oauthId = account.providerAccountId;
          await existing.save();
        }
        user.id = existing._id.toString();
      }
      return true;
    },

    async jwt({ token, user }: any) {
      if (user?.role === "admin") token.role = "admin";
      if (user?.id) token.sub = user.id;
      return token;
    },

    async session({ session, token }: any) {
      await connectDB(); // ✅
      if (!session?.user || !token) return session;

      if (token.role === "admin") {
        session.user.role = "admin";
      } else if (session.user.email) {
        let dbUser = await User.findById(token.sub);
        if (!dbUser) {
          dbUser = await User.findOne({
            email: session.user.email.toLowerCase(),
          });
        }
        if (dbUser) {
          session.user.walletAddr = dbUser.walletAddr;
          session.user.blocked = dbUser.blocked;
          session.user.name = dbUser.name;

          const org = await Org.findOne({
            $or: [
              { contactEmail: dbUser.email },
              { walletAddr: dbUser.walletAddr },
            ],
            approved: true,
          });

          if (org) {
            session.user.isOrg = true;
            session.user.orgCode = org.orgCode;
            session.user.orgName = org.name;
            session.user.orgWalletAddr = org.walletAddr;
          }
        }
      }
      return session;
    },
  },

  pages: { signIn: "/auth" },
  secret: process.env.NEXTAUTH_SECRET,
};