const fetch = global.fetch; 

let ipSet = null;


async function loadBlocklist() {
    if (ipSet) return ipSet; 
    console.log("fetche Blocklist neu")
    const url = "https://lists.blocklist.de/lists/all.txt";
    const res = await fetch(url);
    const text = await res.text();

  
    ipSet = new Set(
        text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)
    );

    return ipSet;
}


exports.isIpBlocked = async function(ip) {
    console.log(ip)
    if (!ip) {
        console.log("IP ist undefined oder leer");
        return false;
    }

    const set = await loadBlocklist();

    ip = String(ip).trim(); 

   
    const result = set.has(ip);
    console.log(result)
  
    return result;
};
