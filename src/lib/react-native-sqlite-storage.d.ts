declare module 'react-native-sqlite-storage' {
    export interface SQLiteDatabase {
        executeSql(
            sql: string,
            params?: any[]
        ): Promise<[ResultSet]>;
        close(): Promise<void>;
        isConnected(): boolean;
    }

    export interface ResultSet {
        rows: {
            length: number;
            item(index: number): any;
        };
        rowsAffected?: number;
        insertId?: number;
    }

    export interface SQLiteOptions {
        name?: string;
        location?: string;
        createFromLocation?: string;
    }

    export function openDatabase(
        name: string,
        version: string,
        displayName: string,
        size: number,
        options?: SQLiteOptions
    ): Promise<SQLiteDatabase>;

    export function DEBUG(debug: boolean): void;
    export function enablePromise(enable: boolean): void;

    const SQLiteStorage: {
        openDatabase: typeof openDatabase;
        DEBUG: typeof DEBUG;
        enablePromise: typeof enablePromise;
    };

    export default SQLiteStorage;
}

