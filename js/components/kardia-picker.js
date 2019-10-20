const bufferToHexString = buffer =>
    Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');

const utf8encoder = new TextEncoder();

customElements.define("kardia-picker",
    class extends HTMLElement {
        constructor() {
            super();
            this.bind(this);
        }
        bind(element) {
            element.attachEvents = element.attachEvents.bind(element);
            element.renderDom = element.renderDom.bind(element);
            element.cacheDom = element.cacheDom.bind(element);
            element.search = element.search.bind(element);
            element.handleChange = element.handleChange.bind(element);
        }
        connectedCallback() {
            this.renderDom();
            this.cacheDom();
            this.attachEvents();
        }
        renderDom(){
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = `
                <button id="search">Search</button>
            `;
        }
        cacheDom() {
            this.dom = {
                search: this.shadow.getElementById("search")
            };
        }
        async search() {
            try {
                const device = await navigator.bluetooth.requestDevice({
                    filters: [{ namePrefix: "Kardia6L" }],
                    optionalServices: ["battery_service", "ac060001-328c-a28f-9846-5a8aa212661b"]
                });
                console.log(device.name);
                device.addEventListener('gattserverdisconnected', () => this.onDisconnected(device));
                const gattServer = await device.gatt.connect();

                const primaryService = await gattServer.getPrimaryService("ac060001-328c-a28f-9846-5a8aa212661b");
                if (!primaryService) {
                    throw `${primaryService} Service not found`
                }

                const ecgCharacteristic = await primaryService.getCharacteristic("ac060003-328c-a28f-9846-5a8aa212661b");
                ecgCharacteristic.addEventListener('characteristicvaluechanged', this.handleChange);

                const cmdCharacteristic = await primaryService.getCharacteristic("ac060002-328c-a28f-9846-5a8aa212661b");
                cmdCharacteristic.writeValue(await unlockCode);

                await characteristic.startNotifications();
            } catch(ex){
                console.error(ex.message);
            }
        }
        async getUnlockCode(mode, deviceName){
            const deviceString = utf8encoder.encode("Triangle" + deviceName);
            const deviceHash = await crypto.subtle.digest("SHA-256", deviceString);
            const deviceHashHex = bufferToHexString(deviceHash);
            const truncatedDeviceHashHex = deviceHashHex.substring(0, Math.min(16, deviceHashHex.length));
            const unlockCode = `${mode} K${truncatedDeviceHashHex}`;
            return utf8encoder.encode(unlockCode);
        }
        onDisconnected(device){
            console.log(`${device.name} has disconnected`);
        }
        handleChange(e){
            const data = e.target.value;
            console.log(data.length);
            console.log(data.getUint8(0));
        }
        attachEvents() {
            this.dom.search.addEventListener("click", this.search);
        }
    }
)
