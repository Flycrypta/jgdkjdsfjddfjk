export class ActivityManager {
    static async setActivity(client, activity) {
        if (client && client.user) {
            await client.user.setActivity(activity);
        }
    }
}
