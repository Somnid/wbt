customElements.define("bluetooth-picker",
	class extends HTMLElement {
		static get observedAttributes(){
			return [];
		}
		constructor(){
			super();
			this.bind(this);
		}
		bind(element){
			element.attachEvents = element.attachEvents.bind(element);
            element.cacheDom = element.cacheDom.bind(element);
            element.onSearch = element.onSearch.bind(element);
		}
		connectedCallback(){
			this.cacheDom();
            this.attachEvents();
		}
		cacheDom(){
			this.dom = {};
        }
        search(){
           navigator.bluetooth.requestDevice({
               filters : [
                   {
                       services: ["battery_service"]
                   }
               ]
           })
           .then(device => {
               console.log(device.name);
               console.log(device.paired);
               console.log(device.uuids);
               return device.connectGATT();
           })
           .then(server => {
               return server.getPrimaryService("battery_service");
           })
           .then(service => {
               if(!service){
                   throw "Battery Service not found"
               }
               return service.getCharacteristic("battery_level");
           })
           .then(characteristic => {
               return characteristic.readValue();
           })
           .then(buffer => {
               const data = new DatView(buffer);
               console.log("Battery percentage is " + data.getUint8(0));
           })
           .catch(function(error){
               console.error(error);
           });
        }
		attachEvents(){
            this.dom.search.addEventListener("click", this.onSearch);
		}
		attributeChangedCallback(name, oldValue, newValue){
			this[name] = newValue;
		}
	}
)
