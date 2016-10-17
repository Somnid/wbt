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
    .then(x => {
      this.dom.output.textContent += x.deviceName + "\n";
    })
    .catch(x => this.dom.output.textContent = JSON.stringify(x))
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
