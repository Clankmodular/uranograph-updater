import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@latest/dist/web/index.js';
let device;
let transport;
let esploader;

const statusEl = document.getElementById("status");

document.getElementById("connect").onclick = async () => {
    try {
        statusEl.innerText = "Select device...";

        device = await navigator.serial.requestPort();

        transport = new Transport(device);
        await transport.connect();

        esploader = new ESPLoader({
            transport,
            baudrate: 115200
        });

        await esploader.main();

        statusEl.innerText = "Connected!";
        document.getElementById("flash").disabled = false;

    } catch (e) {
        statusEl.innerText = "Connection failed";
        console.error(e);
    }
};

document.getElementById("flash").onclick = async () => {
    try {
        statusEl.innerText = "Flashing...";

        const files = [
            { data: await fetch("./firmware/bootloader.bin").then(r => r.arrayBuffer()), address: 0x1000 },
            { data: await fetch("./firmware/partitions.bin").then(r => r.arrayBuffer()), address: 0x8000 },
            { data: await fetch("./firmware/uranograph.bin").then(r => r.arrayBuffer()), address: 0x10000 }
        ];

        await esploader.writeFlash({
            fileArray: files,
            eraseAll: true,
            compress: true
        });

        statusEl.innerText = "✅ Update complete";

    } catch (e) {
        statusEl.innerText = "❌ Flash failed";
        console.error(e);
    }
};
