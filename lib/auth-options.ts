import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // Return a mock user for now, or implement real logic
                // For this coding task, consistent with current user prototype

                // Allow "demo" login
                if (credentials?.username === "demo" || credentials?.username === "demo@privacy-shield.de") {
                    return { id: "1", name: "Demo User", email: "demo@privacy-shield.de" }
                }

                return null
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
};
