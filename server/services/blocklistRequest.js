const fetch = global.fetch; // Node 18+ (sonst: node-fetch installieren)

let ipSet = null;

// Lädt die Blocklist einmal und cached sie
async function loadBlocklist() {
    if (ipSet) return ipSet; // Cache nutzen
    console.log("fetche Blocklist neu")
    const url = "https://lists.blocklist.de/lists/all.txt";
    const res = await fetch(url);
    const text = await res.text();

    // Set mit IP-Strings erstellen
    ipSet = new Set(
        text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)
    );

    return ipSet;
}

// Prüft, ob eine IP in der Blocklist ist
exports.isIpBlocked = async function(ip) {
    console.log(ip)
    if (!ip) {
        console.log("IP ist undefined oder leer");
        return false;
    }

    const set = await loadBlocklist();

    ip = String(ip).trim(); // in String umwandeln und trimmen

   
    const result = set.has(ip); // prüft die tatsächliche IP
    console.log(result)
  
    return result;
};
