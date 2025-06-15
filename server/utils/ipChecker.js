function isValidIPv4Address(input) {
    // IPv4 Adresse besteht aus vier Zahlenblöcken, die durch Punkte getrennt sind
    const parts = input.split(".");

    // Eine gültige IPv4 Adresse hat genau vier Teile
    if (parts.length !== 4) {
        return false;
    }

    // Überprüfen, ob jeder Teil eine Zahl zwischen 0 und 255 ist
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Überprüfen, ob der Teil eine Zahl ist und im Bereich von 0 bis 255 liegt
        if (!/^\d+$/.test(part) || Number(part) < 0 || Number(part) > 255) {
            return false;
        }
    }

    return true;
}

export default async function ipLookup(ip) {
    if (!isValidIPv4Address(ip)) {
        return { country: "Invalid IP Address", region: "Invalid IP Address" };
    }
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        const output = { country: data.country, region: data.regionName };

        return output;
    } catch (error) {
        console.error(error);
        return {
            country: "Error occurred while fetching data",
            region: "Error occurred while fetching data"
        };
    }
}
