import { beforeAll, describe, it, expect } from "bun:test";
import { LivePix } from "./index";
import assert from "node:assert";

describe("LivePix", async () => {
    let access_token: LivePix.AccessToken;
    beforeAll(async () => {
        expect(Bun).toBeDefined();
        assert(process.env.LIVE_PIX_ID, "LIVE_PIX_ID is required");
        assert(process.env.LIVE_PIX_SECRET, "LIVE_PIX_SECRET is required");
        access_token = await LivePix.get_access_token(process.env.LIVE_PIX_ID, process.env.LIVE_PIX_SECRET, LivePix.Scopes.all);
        assert(access_token.access_token, "access token is required");
        assert(access_token.expires_in > Date.now(), "expire time must be valid");
        assert(access_token.scope, "scope is required");
        assert(access_token.token_type === "bearer", "token type must be bearer");
    });
    it('get_account', async () => {
        const account = await LivePix.get_account(access_token.access_token);
        assert(account.id, "id is required");
        assert(account.username, "username is required");
        assert(account.displayName, "displayName is required");
        assert(account.avatar, "avatar is required");
    });
    it('get_wallet', async () => {
        const wallet = await LivePix.get_wallet(access_token.access_token);
        assert(wallet.length > 0, "wallet list is empty");
        for (const item of wallet) {
            assert(item.currency, "currency is required");
            assert(item.balance >= 0, "balance must be >= 0");
            assert(item.balanceHeld >= 0, "balanceHeld must be >= 0");
            assert(item.balancePending >= 0, "balancePending must be >= 0");
        }
    });
    it('get_payments', async () => {
        const payments = await LivePix.get_payments(access_token.access_token);
        for (const payment of payments) {
            assert(payment.reference, "reference is required");
            assert(payment.proof, "proof is required");
            assert(payment.id, "id is required");
            assert(payment.amount >= 0, "amount must be >= 0");
            assert(payment.currency, "currency is required");
            assert(Date.parse(payment.createdAt) < Date.now(), "created date must be valid");
        }
    });
    it('set_payment', async () => {
        const payment = await LivePix.set_payment(access_token.access_token, 100, "https://www.youtube.com/");
        assert(payment.reference, "reference is required");
        assert(payment.redirectUrl, "redirectUrl is required");
    });
    it('get_messages', async () => {
        const messages = await LivePix.get_messages(access_token.access_token);
        for (const message of messages) {
            assert(message.reference, "reference is required");
            assert(message.proof, "proof is required");
            assert(message.id, "id is required");
            assert(message.amount >= 0, "amount must be >= 0");
            assert(message.username, "musername is required");
            assert(message.message, "message is required");
            assert(message.currency, "currency is required");
            assert(Date.parse(message.createdAt) < Date.now(), "created date must be valid");
        }
    });
    it('set_message', async () => {
        const message = await LivePix.set_message(access_token.access_token, 100, "admin", "hello", "https://www.youtube.com/");
        assert(message.reference, "reference is required");
        assert(message.redirectUrl, "redirectUrl is required");
    });
});

