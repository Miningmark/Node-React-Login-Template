export class AdminPanelService {
    constructor() {}

    async getServerLogs(limit: number | undefined, offset: number | undefined) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Benutzer zurück gegeben" };

        return jsonResponse;
    }
}
