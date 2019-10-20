customElements.define("bluetooth-picker",
    class extends HTMLElement {
        static get observedAttributes() {
            return ["services", "characteristics"];
        }
        constructor() {
            super();
            this.bind(this);
        }
        bind(element) {
            element.attachEvents = element.attachEvents.bind(element);
            element.renderDom = element.renderDom.bind(element);
            element.cacheDom = element.cacheDom.bind(element);
            element.search = element.search.bind(element);
        }
        connectedCallback() {
            if(!this.services){
                this.services = ["battery_service"];
                this.characteristics = ["battery_level"];
            }
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
                    filters: [
                        {
                            services: this.services
                        }
                    ]
                });
                console.log(device.name);
                console.log(device.paired);
                console.log(device.uuids);
                device.addEventListener('gattserverdisconnected', () => this.onDisconnected(device));
                const gattServer = await device.gatt.connect();

                const primaryService = await gattServer.getPrimaryService(this.services[0]);
                if (!primaryService) {
                    throw `${primaryService} Service not found`
                }

                const characteristic = await primaryService.getCharacteristic(this.characteristics[0]);
                const data = await characteristic.readValue();
                console.log("value is: " + data.getUint8(0));
            } catch(ex){
                console.error(ex.message);
            }
        }
        onDisconnected(device){
            console.log(`${device.name} has disconnected`);
        }
        attachEvents() {
            this.dom.search.addEventListener("click", this.search);
        }
        attributeChangedCallback(name, oldValue, newValue) {
            switch(name){
                case "services":
                    this.services = newValue.split(",").map(x => x.trim());
                    return;
                case "characteristics":
                    this.characteristics = newValue.split(",").map(x => x.trim());
                    return;
            }
        }
    }
)
