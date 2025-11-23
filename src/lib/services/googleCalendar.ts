import { prisma } from "@/lib/prisma"

type CalendarConnection = {
    accessToken: string
    refreshToken: string | null
    expiresAt: Date
    tenantId: string
}

async function refreshAccessToken(connection: CalendarConnection) {
    if (!connection.refreshToken) throw new Error("No refresh token available")

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            refresh_token: connection.refreshToken,
            grant_type: "refresh_token"
        })
    })

    const tokens = await res.json()
    if (tokens.error) throw new Error(tokens.error)

    await prisma.tenantGoogleConnection.update({
        where: { tenantId: connection.tenantId },
        data: {
            accessToken: tokens.access_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
        }
    })

    return tokens.access_token
}

async function getValidToken(connection: CalendarConnection) {
    if (new Date() >= connection.expiresAt) {
        return await refreshAccessToken(connection)
    }
    return connection.accessToken
}

export async function listAvailability(connection: CalendarConnection, start: Date, end: Date) {
    const token = await getValidToken(connection)
    
    // Free/Busy query
    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            items: [{ id: "primary" }] // Primary calendar
        })
    })

    const data = await res.json()
    return data.calendars?.primary?.busy || []
}

export async function createEvent(connection: CalendarConnection, eventData: { summary: string, description?: string, start: Date, end: Date, attendees?: string[] }) {
    const token = await getValidToken(connection)

    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            summary: eventData.summary,
            description: eventData.description,
            start: { dateTime: eventData.start.toISOString() },
            end: { dateTime: eventData.end.toISOString() },
            attendees: eventData.attendees?.map(email => ({ email }))
        })
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    
    return data.id
}
