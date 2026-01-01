const fetch = global.fetch; 

let ipSet = null;


async function loadBlocklist() {
    if (ipSet) return ipSet; 
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
        return false;
    }

    const set = await loadBlocklist();

    ip = String(ip).trim(); 

   
    const result = set.has(ip);
  
    return result;
};
