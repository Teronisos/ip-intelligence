type DnsAnswer = {
    name: string;
    type: number;
    TTL: number;
    data: string;
};


const ResolveDomain = async (domain: string): Promise<string[]> => {
    try {
        const res = await fetch(
            `https://dns.google/resolve?name=${domain}&type=A`
        );
        const data = await res.json();

        const answers: DnsAnswer[] = data.Answer || [];

        const ips = answers
            .filter((a) => a.type === 1) // 1 = A-Record (IPv4)
            .map((a) => a.data);

        return ips;
    } catch (e) {
        console.error("DNS lookup failed for:", domain);
        return [];
    }
};

export default ResolveDomain;