"use strict";

var AppView = (function(){

	function create(){
		var appView = {};
		bind(appView);
		appView.init();
		return appView;
	}

	function bind(appView){
		appView.installServiceWorker = installServiceWorker.bind(appView);
		appView.serviceWorkerInstalled = serviceWorkerInstalled.bind(appView);
		appView.serviceWorkerInstallFailed = serviceWorkerInstallFailed.bind(appView);
		appView.cacheDom = cacheDom.bind(appView);
		appView.attachEvents = attachEvents.bind(appView);
		appView.init = init.bind(appView);

    appView.scan = scan.bind(appView);
    appView.batteryLevelChanged = batteryLevelChanged.bind(appView);
	}

	function installServiceWorker(){
		if("serviceWorker" in navigator){
			navigator.serviceWorker.register("service-worker.js", {scope: "./"})
				.then(this.serviceWorkerInstalled)
				.catch(this.serviceWorkerInstallFailed);
		}
	}

	function serviceWorkerInstalled(registration){
		console.log("App Service registration successful with scope:", registration.scope);
	}

	function serviceWorkerInstallFailed(error){
		console.error("App Service failed to install", error);
	}

	function cacheDom(){
		this.dom = {};
    this.dom.search = document.querySelector("#scan");
    this.dom.output = document.querySelector("#output");
	}

	function attachEvents(){
    this.dom.search.addEventListener("click", this.scan);
	}

  function scan(){
    navigator.bluetooth.requestDevice({
      filters : [{
        services : ["battery_service"]
      }]
    })
    .then(device => {
      this.dom.output.textContent += device.name + "\n";
      return device.gatt.connect();
    })
    .then(gatt => {
      console.log("gatt", gatt);
      return gatt.getPrimaryService("battery_service");
    })
    .then(service => {
      console.log("service", service);
      return service.getCharacteristic("battery_level");
    })
    .then(characteristic => {
      console.log("characteristic", characteristic);
      characteristic.addEventListener("characteristicvaluechanged", this.batteryLevelChanged);
      return characteristic.readValue();
    })
    .then(x => {
      const value = x.getUint8(0);
      this.dom.output.textContent = "Read Value:" + value + "\n";
    })
    .catch(x => this.dom.output.textContent = "Error: " + JSON.stringify(x) + "\n")
  }

  function batteryLevelChanged(e){
    const value = e.target.value.getUint8(0);
    console.log(`Value changed to: ${value}%`);
  }

	function getQueryData(){
		let searchParams = new URLSearchParams(window.location.search.substr(1));
	}

	function init(){
		this.installServiceWorker();
		this.cacheDom();
		this.attachEvents();
	}

	return {
		create : create
	};

})();
