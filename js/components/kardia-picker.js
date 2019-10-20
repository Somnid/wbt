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

                const characteristic = await primaryService.getCharacteristic("ac060003-328c-a28f-9846-5a8aa212661b");
                characteristic.addEventListener('characteristicvaluechanged', this.handleChange);
                await characteristic.startNotifications();
            } catch(ex){
                console.error(ex.message);
            }
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
