import assert from "node:assert";

/** https://docs.livepix.gg/api */
export namespace LivePix {

    export type AccessToken = { access_token: string, expires_in: number, scope: string, token_type: string }
    export type Account = { id: string, email?: string, username: string, displayName: string, avatar: string }
    export type Wallet = { currency: string, balance: number, balanceHeld: number, balancePending: number }
    export type Payment = { id: string, proof: string, reference: string, amount: number, currency: string, createdAt: string }
    export type Message = Payment & { username: string, message: string, flagged: boolean }
    export type Redirect = { reference: string, redirectUrl: string }

    export enum Scopes {
        controls = "controls offline webhooks",
        write = "rewards:write payments:write messages:write subscriptions:write subscription-plans:write",
        read = "account:read wallet:read currencies:read rewards:read payments:read messages:read subscriptions:read subscription-plans:read",
        all = "controls offline webhooks account:read wallet:read currencies:read rewards:read rewards:write payments:read payments:write messages:read messages:write subscriptions:read subscriptions:write subscription-plans:read subscription-plans:write"
    }

    export async function get_access_token(client_id: string, client_secret: string, scope: Scopes = Scopes.read): Promise<AccessToken> {
        assert(client_id && client_secret, "client_id and client_secret are required");
        const options: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}&scope=${scope}`
        };
        const response = await fetch('https://oauth.livepix.gg/oauth2/token', options);
        assert(response.ok, `${response.status} ${response.statusText}`);
        const data = await response.json();
        return { ...data, expires_in: Date.now() + data.expires_in * 1000 };
    }

    export async function get_account(access_token: string): Promise<Account> {
        assert(access_token, "access_token is required");
        const options: RequestInit = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` }
        };
        const response = await fetch("https://api.livepix.gg/v2/account", options);
        assert(response.ok, `${response.status} ${response.statusText}`);
        return (await response.json()).data;
    }

    export async function get_wallet(access_token: string): Promise<Wallet[]> {
        assert(access_token, "access_token is required");
        const options: RequestInit = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` }
        };
        const response = await fetch(`https://api.livepix.gg/v2/wallet`, options);
        assert(response.ok, `${response.status} ${response.statusText}`);
        return (await response.json()).data;
    }

    export async function get_payments(access_token: string, reference?: string): Promise<Payment[]> {
        assert(access_token, "access_token is required");
        const options: RequestInit = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` }
        };
        const response = await fetch(`https://api.livepix.gg/v2/payments${reference ? `?reference=${reference}` : ""}`, options);
        assert(response.ok, `${response.status} ${response.statusText}`);
        return (await response.json()).data;
    }

    /** amount in cents */
    export async function set_payment(access_token: string, amount: number, redirectUrl: string): Promise<Redirect> {
        assert(access_token, "access_token is required");
        assert(amount >= 100, "amount must be >= 100");
        assert(URL.canParse(redirectUrl), "redirectUrl must be valid");
        const options: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
            body: JSON.stringify({ amount, currency: "BRL", redirectUrl })
        };
        const response = await fetch(`https://api.livepix.gg/v2/payments`, options);
        assert(response.ok, `${response.status} ${response.statusText}`);
        return (await response.json()).data;
    }

    export async function get_messages(access_token: string, proof?: string): Promise<Message[]> {
        assert(access_token, "access_token is required");
        const options: RequestInit = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` }
        };
        const response = await fetch(`https://api.livepix.gg/v2/messages${proof ? `?proof=${proof}` : ""}`, options);
        assert(response.ok, `${response.status} ${response.statusText}`);
        return (await response.json()).data;
    }

    /** amount in cents */
    export async function set_message(access_token: string, amount: number, username: string, message: string, redirectUrl: string): Promise<Redirect> {
        assert(access_token, "access_token is required");
        assert(amount >= 100, "amount must be >= 100");
        assert(username && message, "username and message is required");
        assert(URL.canParse(redirectUrl), "redirectUrl must be valid");
        const options: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
            body: JSON.stringify({ username, message, amount, currency: "BRL", redirectUrl })
        };
        const response = await fetch(`https://api.livepix.gg/v2/messages`, options);
        assert(response.ok, `${response.status} ${response.statusText}`);
        return (await response.json()).data;
    }
}
