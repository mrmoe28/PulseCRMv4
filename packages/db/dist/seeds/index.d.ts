export declare function seedDatabase(): Promise<{
    organizations: {
        demoOrg: any;
    };
    users: {
        adminUser: any;
        secondAdminUser: any;
    };
    companies: {
        company1: any;
        company2: any;
        company3: any;
    };
    contacts: {
        contact1: any;
        contact2: any;
    };
    jobs: {};
}>;
export declare function resetDatabase(): Promise<void>;
//# sourceMappingURL=index.d.ts.map