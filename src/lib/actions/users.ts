"use server";

import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
    try {
        const result = await db.query.users.findMany({
            orderBy: (users, { asc }) => [asc(users.name)],
        });

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: 'Failed to fetch users' };
    }
}

export async function getUserById(userId: string) {
    try {
        const result = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!result) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: 'Failed to fetch user' };
    }
}

export async function getUserCompanies(userId: string) {
    try {
        const result = await db.query.companies.findMany({
            where: eq(companies.ownerId, userId),
        });

        if (!result) {
            return { success: false, error: 'Companies not found' };
        }

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: 'Failed to fetch user companies' };
    }
}