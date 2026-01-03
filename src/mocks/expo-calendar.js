// Mock for expo-calendar to prevent web build failures
export const requestRemindersPermissionsAsync = async () => {
    throw new Error("Simulated web environment error to trigger fallback");
};

export const getCalendarsAsync = async () => {
    console.warn("expo-calendar: getCalendarsAsync is not supported on web");
    return [];
};

export const getRemindersAsync = async () => {
    console.warn("expo-calendar: getRemindersAsync is not supported on web");
    return [];
};

export const EntityTypes = {
    REMINDER: 'REMINDER',
    EVENT: 'EVENT'
};
