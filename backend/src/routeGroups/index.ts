export interface GroupEntry {
    groupName: string;
    groupDescription: string;
}

export const defineGroup = (groupName: string, groupDescription: string) =>
    ({
        groupName,
        groupDescription
    }) satisfies GroupEntry;

export const isGroupEntry = (x: unknown): x is GroupEntry =>
    !!x &&
    typeof x === "object" &&
    x !== null &&
    "groupName" in (x as any) &&
    "groupDescription" in (x as any);
