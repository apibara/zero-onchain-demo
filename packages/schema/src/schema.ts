import {
    ANYONE_CAN,
    createSchema,
    createTableSchema,
    definePermissions,
    NOBODY_CAN,
    type ExpressionBuilder,
    type Row,
} from "@rocicorp/zero";

const balanceSchema = createTableSchema({
    tableName: "balance",
    columns: {
        address: "string",
        lastUpdated: "number",
        balance: "number",
        balanceExact: "string",
    },
    primaryKey: "address",
});

export const transferSchema = createTableSchema({
    tableName: "transfer",
    columns: {
        id: "string",
        from: "string",
        to: "string",
        amount: "number",
        amountExact: "string",
        transactionHash: "string",
        blockNumber: "number",
        blockTimestamp: "number",
    },
    primaryKey: "id",
});

export const watchedAddressSchema = createTableSchema({
    tableName: "watchedAddress",
    columns: {
        id: "string",
        userId: "string",
        address: "string",
    },
    primaryKey: "id",
    relationships: {
        balance: {
            sourceField: "address",
            destField: "address",
            destSchema: balanceSchema,
        }
    },
});

export const schema = createSchema({
    version: 1,
    tables: {
        balance: balanceSchema,
        transfer: transferSchema,
        watchedAddress: watchedAddressSchema,
    },
});

export type Schema = typeof schema;
export type Balance = Row<typeof balanceSchema>;
export type Transfer = Row<typeof transferSchema>;
export type WatchedAddress = Row<typeof watchedAddressSchema>;

type AuthData = {
    userId: string;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
    const allowIfOwner = (authData: AuthData, { cmp }: ExpressionBuilder<typeof watchedAddressSchema>) => {
        return cmp("userId", "=", authData.userId)
    };

    return {
        balance: {
            row: {
                insert: ANYONE_CAN,
                update: {
                    preMutation: ANYONE_CAN
                },
                delete: NOBODY_CAN,
            }
        },
        transfer: {
            row: {
                insert: ANYONE_CAN,
                update: {
                    preMutation: NOBODY_CAN,
                },
                delete: NOBODY_CAN,
            }
        },
        watchedAddress: {
            row: {
                insert: ANYONE_CAN,
                update: {
                    preMutation: [allowIfOwner],
                },
                delete: [allowIfOwner],
            },
        }
    }
});
