sap.ui.define(["sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./Dialog1",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/ui/core/Fragment",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",

		"sap/ui/model/FilterOperator",
		"sap/ui/model/odata/ODataModel",
		"sap/ui/model/json/JSONModel",
	], function (BaseController, MessageBox, Dialog1, Utilities, History, Fragment, Filter, MessageToast, FilterOperator, ODataModel,
		JSONModel) {
		"use strict";

		return BaseController.extend("com.sap.build.ba293bd41-us_1.poCreategrunt.controller.Page1", {
			handleRouteMatched: function (oEvent) {

				this.baseval = [];
				this.ci_att1 = [];
				this.purOrgKey = this.byId("idEditOrg").getSelectedKey();
				this.item = "10";
				this.dataModel = new JSONModel({
					"itemTable": [{
						"Empty1": this.item,
						"Empty2": "",
						"Empty3": "",
						"Empty4": "",
						"Empty5": "",
						"Empty6": "",
						"Empty7": "",
						"Empty8": "",
						"Empty9": ""

					}]

				});
				this.getView().setModel(this.dataModel, "dataModel");

			},

			_onFileUploaderChange: function () {

				var oFileuploader = this.getView().byId("fileUploader"); //uploader control
				var ci_attach1 = this.getView().byId("UploadCollection"); //list control

				var sFilename = oFileuploader.getValue(); // gives both name and type
				var file = jQuery.sap.domById(oFileuploader.getId() + "-fu").files[0]; //provide entire file info
				var filename = sFilename.replace(/(\.[^/.]+)+$/, ""); // File Name
				var fileext = sFilename.slice((sFilename.lastIndexOf(".") - 1 >>> 0) + 2); // File Extension
				var sfileExt = fileext.substring(0, 3);
				var FileExt = sfileExt.toUpperCase();
				var that = this;
				if (file) {
					var reader = new FileReader();
					reader.onload = function (readerEvt) {
						var binaryString = readerEvt.target.result;
						var base64 = btoa(binaryString);
						oFileuploader.setValue();
						that.baseval.push(base64);
						console.log(that.baseval);
						var fileObject = {
							Name: filename,
							Ext: FileExt,
							Base64: base64
						};
						that.ci_att1.push(fileObject);
						var oModel = new sap.ui.model.json.JSONModel(that.ci_att1);
						ci_attach1.setModel(oModel);
						var oItems = new sap.m.ObjectListItem({
							icon: {
								path: "Ext",
								formatter: function (subject) {
									var lv = subject;
									if (lv === 'TXT') {
										return "sap-icon://document-text";
									} else if (lv === 'JPG' || lv === 'PNG' || lv === 'BMP') {
										return "sap-icon://attachment-photo";
									} else if (lv === 'PDF') {
										return "sap-icon://pdf-attachment";
									} else if (lv === 'DOC') {
										return "sap-icon://doc-attachment";
									} else if (lv === 'XLS') {
										return "sap-icon://excel-attachment";
									} else if (lv === 'MP3') {
										return "sap-icon://attachment-audio";
									} else if (lv === 'XLS') {
										return "sap-icon://excel-attachment";
									} else if (lv === 'PPT') {
										return "sap-icon://ppt-attachment";
									} else {
										return "sap-icon://document";
									}
								}
							},
							title: "{Name}.{Ext}",
							type: "Active",
						});
						ci_attach1.bindItems("/", oItems);
						that.getView().getModel("oGlobalModel").setProperty("/ci_att1", that.ci_att1);
					};
				}
				reader.readAsBinaryString(file);

			},
			deleteUploadedFile: function (oEvent) {
				var path = oEvent.getParameter('listItem').getBindingContext().getPath();
				var index = parseInt(path.substring(path.lastIndexOf('/') + 1));
				//	var list_ID = sap.ui.getCore().byId(oEvent.getSource().sId);
				var data = oEvent.getSource().getModel();
				//	var data = list_ID.getModel();
				var d = data.getData();
				d.splice(index, 1);
				data.setData(d);
			},
			onBack: function () {
				window.open("https://dashboarddesigngrunt-ba293bd41.dispatcher.us1.hana.ondemand.com/index.html?hc_reset#/PM", "_self")
			},

			/*	_onUploadCollectionUploadComplete: function(oEvent) {
	
				var oFile = oEvent.getParameter("files")[0];
				var iStatus = oFile ? oFile.status : 500;
				var sResponseRaw = oFile ? oFile.responseRaw : "";
				var oSourceBindingContext = oEvent.getSource().getBindingContext();
				var sSourceEntityId = oSourceBindingContext ? oSourceBindingContext.getProperty("") : null;
				var oModel = this.getView().getModel();

				return new Promise(function(fnResolve, fnReject) {
					if (iStatus !== 200) {
						fnReject(new Error("Upload failed"));
					} else if (oModel.hasPendingChanges()) {
						fnReject(new Error("Please save your changes, first"));
					} else if (!sSourceEntityId) {
						fnReject(new Error("No source entity key"));
					} else {
						try {
							var oResponse = JSON.parse(sResponseRaw);
							var oNewEntityInstance = {};

							oNewEntityInstance[""] = oResponse["ID"];
							oNewEntityInstance[""] = sSourceEntityId;
							oModel.createEntry("", {
								properties: oNewEntityInstance
							});
							oModel.submitChanges({
								success: function(oResponse) {
									var oChangeResponse = oResponse.__batchResponses[0].__changeResponses[0];
									if (oChangeResponse && oChangeResponse.response) {
										oModel.resetChanges();
										fnReject(new Error(oChangeResponse.message));
									} else {
										oModel.refresh();
										fnResolve();
									}
								},
								error: function(oError) {
									fnReject(new Error(oError.message));
								}
							});
						} catch (err) {
							var message = typeof err === "string" ? err : err.message;
							fnReject(new Error("Error: " + message));
						}
					}
				}).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},
			_onUploadCollectionChange: function(oEvent) {

				var oUploadCollection = oEvent.getSource();
			
				var aFiles = oEvent.getParameter('files');

				if (aFiles && aFiles.length) {
					var oFile = aFiles[0];
					var sFileName = oFile.name;

					var oDataModel = this.getView().getModel();
					if (oUploadCollection && sFileName && oDataModel) {
						var sXsrfToken = oDataModel.getSecurityToken();
						var oCsrfParameter = new sap.m.UploadCollectionParameter({
							name: "x-csrf-token",
							value: sXsrfToken
						});
						oUploadCollection.addHeaderParameter(oCsrfParameter);
						var oContentDispositionParameter = new sap.m.UploadCollectionParameter({
							name: "content-disposition",
							value: "inline; filename=\"" + encodeURIComponent(sFileName) + "\""
						});
						oUploadCollection.addHeaderParameter(oContentDispositionParameter);
					} else {
						throw new Error("Not enough information available");
					}
				}

			},
			_onUploadCollectionTypeMissmatch: function() {
				return new Promise(function(fnResolve) {
					sap.m.MessageBox.warning("The file you are trying to upload does not have an authorized file type (JPEG, JPG, GIF, PNG, TXT, PDF, XLSX, DOCX, PPTX).", {
						title: "Invalid File Type",
						onClose: function() {
							fnResolve();
						}
					});
				}).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err);
					}
				});

			},
			_onUploadCollectionFileSizeExceed: function() {
				return new Promise(function(fnResolve) {
					sap.m.MessageBox.warning("The file you are trying to upload is too large (10MB max).", {
						title: "File Too Large",
						onClose: function() {
							fnResolve();
						}
					});
				}).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err);
					}
				});

			},*/

			handleIconMainTabBarSelect: function (oEvent) {
				var icon = this.getView().byId("idIconTabBar");
				var mkey = oEvent.getParameters().key;
				if (mkey === "Plant") {

					var plant = sap.ui.core.Fragment.byId("tablefragment", "idFragPlant").setSelectedKey("");
					var materialtype = sap.ui.core.Fragment.byId("tablefragment", "materialType").setSelectedKey("");
					var materialdes = sap.ui.core.Fragment.byId("tablefragment", "materialDesc").setSelectedKey("");

					var tableres = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
					tableres.destroyItems();
				} else if (mkey === "MaterialType") {
					var plant = sap.ui.core.Fragment.byId("tablefragment", "idFragPlant").setSelectedKey("");
					var materialtype = sap.ui.core.Fragment.byId("tablefragment", "materialType").setSelectedKey("");
					var materialdes = sap.ui.core.Fragment.byId("tablefragment", "materialDesc").setSelectedKey("");
					var tableres = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
					tableres.destroyItems();
				} else if (mkey === "MaterialDescription") {
					var plant = sap.ui.core.Fragment.byId("tablefragment", "idFragPlant").setSelectedKey("");
					var materialtype = sap.ui.core.Fragment.byId("tablefragment", "materialType").setSelectedKey("");
					var materialdes = sap.ui.core.Fragment.byId("tablefragment", "materialDesc").setSelectedKey("");
					var tableres = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
					tableres.destroyItems();
				}
			},

			addItemsDialog: function (oEvent) {
				var index = oEvent.getSource().getParent().getBindingContext("dataModel").sPath.split("/")[2];
				this.valueHelpIndex = index;
				this.plantf4();
				this.materialtypef4();
				this.materialdecsf4();
				this.table.open();

			},
			onCloseDialog: function (oEvent) {
				this.table.close();
				this.ClearFilter();
			},
			plantf4: function (oEvent) {

				var that = this;
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_F4_SRV/');
				var sPath = "/PlantSet";
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/PlantSet", oData.results);
					}
				});

			},
			materialtypef4: function () {
				var that = this;
				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
				var sPath = "/MaterialTypeSet";
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/MaterialSet", oData.results);
					}
				});
			},
			materialdecsf4: function () {
				var that = this;
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_F4_SRV/');
				var sPath = "/MaterialSet";
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/Materialdecs", oData.results);
					}
				});
			},
			addrow: function () {
				var table = this.getView().getModel("dataModel").getProperty("/itemTable");
				var itemTab1 = this.getView().byId("idEditTable");
				var rowlen = itemTab1.getItems().length;
				if (rowlen === 0) {
					this.item = "10";
					this.dataModel = new JSONModel({
						"itemTable": [{
							"Empty1": this.item,
							"Empty2": "",
							"Empty3": "",
							"Empty4": "",
							"Empty5": "",
							"Empty6": "",
							"Empty7": "",
							"Empty8": "",
							"Empty9": ""

						}]

					});
					this.getView().setModel(this.dataModel, "dataModel");
				} else {

					var rowMinus = rowlen - 1;
					var that = this;

					for (var i = 0; i < rowlen; i++) {
						this.itemadtab = itemTab1.getItems()[i];
						this.itemadr = itemTab1.getItems()[rowMinus].getCells()[0].getValue();
						var operation11 = Number(this.itemadr);
						that.itemFrag = operation11 + 10;
						// that.itemFragNum = "" + that.itemFrag + "";
						// that.item = that.itemFragNum.padStart(4, '0');

					}

					var row = {
						"Empty1": that.itemFrag,
						"Empty2": "",
						"Empty3": "",
						"Empty4": "",
						"Empty5": "",
						"Empty6": "",
						"Empty7": "",
						"Empty8": "",
						"Empty9": "",
						"Empty10": ""

					};
					table.push(row);
					this.dataModel.refresh();
				}

			},
			deleteRow: function (oArg) {
				var index = oArg.getSource().getParent().getBindingContext("dataModel").sPath.split("/")[2];
				sap.m.MessageBox.confirm("Are you sure to Delete the Items?", {
					//icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Confirmation",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.NO1],
					onClose: function (oAction, oArg) {
						if (oAction === "YES") {
							var table = this.getView().getModel("dataModel").getProperty("/itemTable");
							table.splice(index, 1);
							this.dataModel.refresh();
						} else {

						}
					}.bind(this)
				});

			},
			onInit: function () {

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.table = sap.ui.xmlfragment("tablefragment", "com.sap.build.ba293bd41-us_1.poCreategrunt.view.Dialog1", this);
				this.getView().addDependent(this.table);

				this.check = "";

				this.result = sap.ui.xmlfragment("results", "com.sap.build.ba293bd41-us_1.poCreategrunt.fragments.result", this);
				this.getView().addDependent(this.result);

				/*	this.oMessageTemplate = new sap.m.MessageItem({
						type: "{Type}",
						title: "{Message}"
					});
					this.oMessagePopover = new sap.m.MessagePopover({
						items: {
							path: "/",
							template: this.oMessageTemplate
						}
					});*/

			},

			onPRRefButton: function () {
				this.getView().byId("manualPO").setType("Default");
				var refPO = this.getView().byId("refPO")._bActive;
				if (refPO === false) {
					this.getView().byId("refPO").setType("Emphasized");
				}
				this.getView().byId("idcreate").setEnabled(true);
				this.getView().byId("idcancel").setEnabled(true);
				this.getView().byId("prCombo").setVisible(true);
				this.getView().byId("idTable").setVisible(true);
				this.getView().byId("idEditTable").setVisible(false);
				this.getView().byId("PRprice").setVisible(true);
				this.getView().byId("Manualprice").setVisible(false);
				this.byId("layout1").setVisible(true);
				this.byId("layout2").setVisible(true);
				this.byId("layout3").setVisible(true);
				this.byId("editlayout1").setVisible(false);
				this.byId("editlayout2").setVisible(false);
				this.byId("editLayout3").setVisible(false);
				this.byId("idEditDocType").setValue();
				this.byId("idEditOrg").setValue();
				this.byId("idEditCompCode").setValue();
				this.byId("idEditVendor").setValue();
				this.byId("idEditPurGrp").setValue();
				this.byId("TypeHere1").setValue();
				this.byId("idEditTable").destroyItems();
				this.byId("idEditName").setValue();
				this.byId("idEditStreet").setValue();
				this.byId("idEditCountry").setValue();
				this.byId("idEditDist").setValue();
				this.byId("idEditPostalCode").setValue();
				this.PRNumberf4();
				this.check = "x";

			},
			PRNumberf4: function () {
				var that = this;
				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
				var sPath = "/PRDetailSet";
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/PRNumber", oData.results);
					}
				}); // purchase org header level data
				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
				var sPath = "/PurchasingGrpSet";
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/Purchasegroup", oData.results);
					}
				});
			},
			onManualPOButton: function () {
				this.getView().byId("refPO").setType("Default");
				var manualPO = this.getView().byId("manualPO")._bActive;
				if (manualPO === false) {
					this.getView().byId("manualPO").setType("Emphasized");
				}
				this.getView().byId("idcreate").setEnabled(true);
				this.getView().byId("idcancel").setEnabled(true);
				this.getView().byId("prCombo").setVisible(false);
				this.byId("layout1").setVisible(false);
				this.byId("layout2").setVisible(false);
				this.byId("layout3").setVisible(false);
				this.byId("editlayout1").setVisible(true); //manual po
				this.byId("editlayout2").setVisible(true); //manual po
				this.byId("editLayout3").setVisible(true); //manual po
				this.getView().byId("Manualprice").setVisible(true);
				this.getView().byId("PRprice").setVisible(false);
				this.getView().byId("idTable").setVisible(false);
				this.getView().byId("idEditTable").setVisible(true);
				this.byId("idAdd").setEnabled(true);
				this.byId("idDocType").setValue();
				this.byId("idPurOrg").setValue();
				this.byId("idCC").setValue();
				this.byId("prvendor").setValue();
				this.byId("PRpurchasegrup").setValue();
				this.byId("idText").setValue();
				this.byId("idTable").destroyItems();
				this.byId("prCombo").setValue();
				this.byId("idName").setValue();
				this.byId("idStreet").setValue();
				this.byId("idCountry").setValue();
				this.byId("idDist").setValue();
				this.byId("idPostalCode").setValue();
				var that = this;

				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
				var sPath = "/CompanyCodeSet";
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/PurchaseOrg", oData.results);
					}
				}); // purchase org header level data
				// var purchasegroup = this.getView().getModel("oGlobalModel").getProperty("/PurchaseOrg");
				// var company_purgrp_code = {
				// 	code: purchasegroup[0]
				// };
				// this.getView().getModel("oGlobalModel").setProperty("/PurchaseOrgcode", company_purgrp_code);

				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
				var sPath = "/PurchasingGrpSet";
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/Purchasegroup", oData.results);
					}
				}); // purchase org header level data

				var today = new Date();
				var dd = today.getDate();

				var mm = today.getMonth() + 1;
				var yyyy = today.getFullYear();
				if (dd < 10) {
					dd = '0' + dd;
				}

				if (mm < 10) {
					mm = '0' + mm;
				}
				today = dd + '.' + mm + '.' + yyyy;
				this.getView().byId("deliverydate").setValue(today);

				this.check = "y";

			},

			onPrNoSelection: function (oEvent) {
				this.prKey = this.getView().byId("prCombo").getSelectedKey();
				this.byId("layout1").setVisible(true);
				this.byId("layout2").setVisible(true);
				this.byId("editlayout1").setVisible(false);
				this.byId("editlayout2").setVisible(false);
				this.bindprdetails();

			},

			bindprdetails: function () {

				if (this.prKey !== "") { // PR number with value combobox
					var that = this;
					var oFilter = [new sap.ui.model.Filter("PRNumber", sap.ui.model.FilterOperator.EQ, this.prKey)]; //filtering the equipment number	
					var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_PO_CREATE_SRV/');
					oModel.read("/POHeaderSet", {
						urlParameters: {
							"$expand": "ToItem" // expand data for items
						},
						filters: oFilter, // passing the filter
						success: function (oData, oResponse) {

								var PRNumber = oData.results[0].PRNumber;
								var DocumentType = oData.results[0].DocumentType;
								var PurchaseOrg = oData.results[0].PurchaseOrg;
								var CompanyCode = oData.results[0].CompanyCode;
								var PurchaseGrp = oData.results[0].PurchaseGrp;
								var HeaderText = oData.results[0].HeaderText;
								var Odatalength = (oData.results).length;

								that.getView().byId("idDocType").setValue(DocumentType);
								that.getView().byId("idText").setValue(HeaderText);

								if (PurchaseOrg === "") {
									that.getView().byId("Purchaseorg").setVisible(false);
									that.getView().byId("Purchaseorgdup").setVisible(true);
									var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
									var sPath = "/CompanyCodeSet";
									oModel.read(sPath, {
										success: function (oData, oResponse) {
											var Odatalength = (oData.results).length;
											that.getView().getModel("oGlobalModel").setSizeLimit(1000);
											that.getView().getModel("oGlobalModel").setProperty("/PurchaseOrg", oData.results);

										}
									}); // PR purchase-org header level data

								} else {

									that.getView().byId("idPurOrg").setValue(PurchaseOrg); //getting value from purchase org
									that.purchaseorg = that.getView().byId("idPurOrg").getValue();
									var CompanyCode = oData.results[0].CompanyCode;
									if (CompanyCode === "") {
										var sPath1 = "/CompanyCodeSet?$filter=PurchasingOrg eq  '" + that.purchaseorg + "'";
										var oModel1 = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/', true);
										oModel1.read(sPath1, {
											success: function (oData, oResponse) {
												var Odatalength = (oData.results).length;
												console.log("oData", oData)
												var CompanyCod = oData.results[0].CompanyCod;
												var CompanyCodDes = oData.results[0].CompanyCodDes;
												that.getView().byId("idCC").setValue(CompanyCod + " - " + CompanyCodDes);
											}
										});
									}

									var Vendor = oData.results[0].Vendor;
									if (Vendor === "") {
										var Filter = [new sap.ui.model.Filter("PurchasingOrg", sap.ui.model.FilterOperator.EQ, that.purchaseorg)];
										var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
										var sPath = "/VendorSet";
										oModel.read(sPath, {
											filters: Filter,
											success: function (oData, oResponse) {
												var Odatalength = (oData.results).length;

												that.getView().getModel("oGlobalModel").setSizeLimit(1000);
												that.getView().getModel("oGlobalModel").setProperty("/PRVendor", oData.results);
											}
										});
									} else if (PurchaseGrp === "") {
										var purOrgKey = that.getView().byId("idPurOrg").getValue();
										that.getView().byId("idPurGrorg").setVisible(false);
										that.getView().byId("idPurGrdup").setVisible(true);
										var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
										var sPath = "/PurchasingGrpSet";
										oModel.read(sPath, {
											success: function (oData, oResponse) {
												var Odatalength = (oData.results).length;
												that.getView().getModel("oGlobalModel").setSizeLimit(1000);
												that.getView().getModel("oGlobalModel").setProperty("/PRPurchasegroup", oData.results);
											}
										}); // purchase org header level data

									}

								}

								var Vendor = oData.results[0].Vendor;
								if (Vendor === "") {
									that.getView().byId("idVendororg").setVisible(false);
									that.getView().byId("idVendordup").setVisible(true);
								} else {
									that.getView().byId("idVendor").setValue(Vendor);
								}
								if (PurchaseGrp === "") {
									that.getView().byId("idPurGrorg").setVisible(false);
									that.getView().byId("idPurGrdup").setVisible(true);
									var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
									var sPath = "/PurchasingGrpSet";
									oModel.read(sPath, {
										success: function (oData, oResponse) {
											var Odatalength = (oData.results).length;
											that.getView().getModel("oGlobalModel").setSizeLimit(1000);
											that.getView().getModel("oGlobalModel").setProperty("/PRPurchasegroup", oData.results);
										}
									}); // purchase org header level data

								} else {
									that.getView().byId("idPurGrp").setValue(PurchaseGrp);
								}

								that.itemspr = oData.results[0].ToItem.results; // read the data and set to globalmodel
								that.getView().getModel("oGlobalModel").setProperty("/prdetails", that.itemspr);

								var tabley = that.getView().byId("idTable");
								var count = tabley.getItems().length;
								for (var i = 0; i < count; i++) {
									that.plant = tabley.getItems()[0].getCells()[6].getValue();
									that.netprice = tabley.getItems()[0].getCells()[2].getValue();
									that.netprice = tabley.getItems()[0].getCells()[2].getValue();
									that.delliverydate = tabley.getItems()[0].getCells()[8].getValue();

								} //loop end

								var oModel1 = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV/');
								var sPath1 = "/PlantDetailsSet('" + that.plant + "')";
								oModel1.read(sPath1, {
									success: function (oData) {

										console.log(oData)
										var name = oData.Name;
										var street = oData.HouseNoStreet;
										var district = oData.City;
										var country = oData.CountryKey;
										var postal = oData.PostalCode;
										var deliverydate = oData.DeliveryDate;
										that.getView().byId("idName").setValue(name);
										that.getView().byId("idStreet").setValue(street);
										that.getView().byId("idCountry").setValue(country);
										that.getView().byId("idDist").setValue(district);
										that.getView().byId("idPostalCode").setValue(postal);
										that.getView().byId("datepickpr").setValue(that.delliverydate);
									}
								}); // code for binding delivery details based on PR

								// code for binding Pricing Condition based on PR
								var tab2 = that.getView().byId("idTable");
								var lengthoffirst = tab2.getItems().length;
								var oFirstItem = tab2.getItems()[0];
								var NetPrice = oFirstItem.getCells()[2].getValue();
								var currency = oFirstItem.getCells()[3].getValue();
								var PRQuantity = oFirstItem.getCells()[4].getValue();
								var TotalValue = oFirstItem.getCells()[7].getValue();
								that.getView().byId("idcurr").setValue(currency);
								that.getView().byId("idnetprice").setValue(NetPrice);
								that.getView().byId("idamount").setValue(TotalValue);
								that.getView().byId("idqty").setValue(
									PRQuantity);

							} // success fun end

					});
				} else { // removing all data PR combo with no value

					this.getView().byId("idDocType").setValue();
					this.getView().byId("idPurOrg").setValue();
					this.getView().byId("prpurchaseorg").setValue();
					this.getView().byId("idCC").setValue();
					this.getView().byId("idVendor").setValue();
					this.getView().byId("prvendor").setValue();
					this.getView().byId("idPurGrp").setValue();
					this.getView().byId("PRpurchasegrup").setValue();
					this.getView().byId("idText").setValue();

					var table = this.getView().byId("idTable").setMode("None");

					var tab2 = this.getView().byId("idTable");
					var lengthoffirst = tab2.getItems().length;
					var oFirstItem = tab2.getItems()[0];
					var NetPrice = oFirstItem.getCells()[2].setValue();
					var currency = oFirstItem.getCells()[3].setValue();
					var PRQuantity = oFirstItem.getCells()[4].setValue();
					var TotalValue = oFirstItem.getCells()[7].setValue();

					this.getView().byId("idnetprice").setValue();
					this.getView().byId("idqty").setValue();
					this.getView().byId("idamount").setValue();
					this.getView().byId("idcurr").setValue();

					this.getView().byId("idName").setValue();
					this.getView().byId("idStreet").setValue();
					this.getView().byId("idCountry").setValue();
					this.getView().byId("datepickpr").setValue();
					this.getView().byId("idDist").setValue();
					this.getView().byId("idPostalCode").setValue();
				}
			},

			PRPurOrgChange: function () {
				this.getView().byId("prvendor").setEnabled(true);
				this.purOrgKey = this.byId("prpurchaseorg").getSelectedKey();
				var sPath = "/CompanyCodeSet?$filter=PurchasingOrg eq  '" + this.purOrgKey + "'";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/', true);
				var oCont = this;
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						console.log("oData", oData)
						var CompanyCod = oData.results[0].CompanyCod;
						var Companycoddes = oData.results[0].CompanyCodDes;
						oCont.getView().byId("idCC").setValue(CompanyCod + " - " + Companycoddes);
					}
				});
				var that = this;

				var Filter = [new sap.ui.model.Filter("PurchasingOrg", sap.ui.model.FilterOperator.EQ, this.purOrgKey)];
				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
				var sPath = "/VendorSet";
				oModel.read(sPath, {
					filters: Filter,
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/PRVendor", oData.results);
					}
				}); // vendorf4

			},
			rowSelectionChanged: function (oEvent) {
				var currency = oEvent.getParameter("listItem").getBindingContext("oGlobalModel").getProperty("Currency");
				var NetPrice = oEvent.getParameter("listItem").getBindingContext("oGlobalModel").getProperty("NetPrice");
				var TotalValue = oEvent.getParameter("listItem").getBindingContext("oGlobalModel").getProperty("TotalValue");
				var PRQuantity = oEvent.getParameter("listItem").getBindingContext("oGlobalModel").getProperty("PRQuantity");

				this.getView().byId("idcurr").setValue(currency);
				this.getView().byId("idnetprice").setValue(NetPrice);
				this.getView().byId("idamount").setValue(TotalValue);
				this.getView().byId("idqty").setValue(PRQuantity);

			},
			rowSelectionChangedpo: function (oEvent) {

				var currency = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("Empty5");
				var NetPrice = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("Empty4");
				var TotalValue = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("Empty8");
				var PRQuantity = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("Empty6");
				this.getView().byId("idcurrpo").setValue(currency);
				this.getView().byId("idpricepo").setValue(NetPrice);
				this.getView().byId("idamountpo").setValue(TotalValue);
				this.getView().byId("idqtypo").setValue(PRQuantity);

			},

			onPurOrgChange: function (oEvent) {
				this.getView().byId("idEditCompCode").setEditable(true);
				this.getView().byId("idEditVendor").setEditable(true);
				this.purOrgKey = this.byId("idEditOrg").getSelectedKey();
				var sPath = "/CompanyCodeSet?$filter=PurchasingOrg eq  '" + this.purOrgKey + "'";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/', true);
				var oCont = this;
				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var compCode = new JSONModel(oData);
						var f4ComboCC = oCont.getView().byId("idEditCompCode");
						f4ComboCC.setModel(compCode, "CompCode");
						var oItems = new sap.ui.core.ListItem({
							key: "{CompCode>CompanyCod}",
							text: "{CompCode>CompanyCod} - {CompCode>CompanyCodDes}"

						});
						f4ComboCC.bindAggregation("items", {
							path: 'CompCode>/results',
							template: oItems
						});
					},
				}); // company code binding based on purchase org
				var that = this;
				var Filter = [new sap.ui.model.Filter("PurchasingOrg", sap.ui.model.FilterOperator.EQ, this.purOrgKey)];
				var oModel = new ODataModel('/sap/opu/odata/sap/ZMM_F4_SRV_01/');
				var sPath = "/VendorSet";
				oModel.read(sPath, {
					filters: Filter,
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						that.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/VendorF4", oData.results);
					}
				}); // vendorf4

			},

			onPlantSelection: function (oEvent) {
				this.plant = oEvent.getSource().getSelectedKey();
				var arrayofPlant = [];
				var that = this;
				var planttable = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
				planttable.setVisible(true);
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_F4_SRV', true);
				var sPath = "/MaterialSet?$filter=Plant eq '" + this.plant + "'";

				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var count = oData.results.length;
						for (var i = 0; i < count; i++) {
							var materialp = oData.results[i].MaterialNumber;
							var descripp = oData.results[i].MaterialNumberDes;
							var plantp = oData.results[i].Plant;
							var uomp = oData.results[i].UOM;
							var pricep = oData.results[i].NetPrice;
							var curp = oData.results[i].CurrencyKey;

							var obj = {
								Materialp: materialp,
								Descripp: descripp,
								Uomp: uomp,
								Plantp: plantp,
								pricep: pricep,
								Currencyp: curp
							};
							arrayofPlant.push(obj);
							var oModelccd = new sap.ui.model.json.JSONModel({
								listdata: arrayofPlant
							});
							planttable.setModel(oModelccd);
						}
						var titems1 = new sap.m.ColumnListItem({
							cells: [new sap.m.Text({
									text: "{Materialp}" //"{itemkey}"
								}),
								new sap.m.Text({
									text: "{Descripp}" //"{itemkey}"
								}),
								new sap.m.Text({
									text: "{Uomp}" //"{itemkey}"
								}),
								new sap.m.Text({
									text: "{Plantp}",
									visible: false //"{itemkey}"
								}),
								new sap.m.Text({
									text: "{pricep}",
									visible: false //"{itemkey}"
								}),
								new sap.m.Text({
									text: "{Currencyp}",
									visible: false //"{itemkey}"
								})

							]
						});

						planttable.bindItems("/listdata", titems1);

					}
				});
			},
			materialTypChange: function (oEvent) {
				this.mataltype = oEvent.getSource().getSelectedKey();
				var arrayofmaterial = [];
				var that = this;
				var materialtable = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
				materialtable.setVisible(true);

				var sPath = "/MaterialSet?$filter=MaterialType eq '" + this.mataltype + "'";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_F4_SRV', true);

				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var count = oData.results.length;

						if (count === 0) {
							var tableres = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
							tableres.destroyItems();
						} else {
							for (var i = 0; i < count; i++) {
								var material = oData.results[i].MaterialNumber;
								var descrip = oData.results[i].MaterialNumberDes;
								var plant = oData.results[i].Plant;
								var price = oData.results[i].NetPrice;
								var uom = oData.results[i].UOM;
								var cur = oData.results[i].CurrencyKey;

								var obj = {
									Materialt: material,
									Descript: descrip,
									Uomt: uom,
									Plantt: plant,
									pricet: price,
									Currencyt: cur
								};
								arrayofmaterial.push(obj);
								var oModelccd = new sap.ui.model.json.JSONModel({
									listdata: arrayofmaterial
								});
								materialtable.setModel(oModelccd);
							}
							var titems1 = new sap.m.ColumnListItem({
								cells: [new sap.m.Text({
										text: "{Materialt}" //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Descript}" //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Uomt}" //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Plantt}",
										visible: false //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{pricet}",
										visible: false //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Currencyt}",
										visible: false //"{itemkey}"
									})

								]
							});

							materialtable.bindItems("/listdata", titems1);
						}
					}
				});
			},
			materialDecs: function (oEvent) {
				this.mataldecs = oEvent.getSource().getSelectedKey();
				var arrayofmaterialdecs = [];
				var that = this;
				var materialtable = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
				materialtable.setVisible(true);

				var sPath = "/MaterialSet?$filter=MaterialNumber eq '" + this.mataldecs + "'";
				var oModel = new ODataModel('/sap/opu/odata/sap/ZPM_F4_SRV', true);

				oModel.read(sPath, {
					success: function (oData, oResponse) {
						var count = oData.results.length;

						if (count === 0) {
							var tableres = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
							tableres.destroyItems();
						} else {
							for (var i = 0; i < count; i++) {
								var material = oData.results[i].MaterialNumber;
								var descrip = oData.results[i].MaterialNumberDes;
								var plant = oData.results[i].Plant;
								var price = oData.results[i].NetPrice;
								var uom = oData.results[i].UOM;
								var cur = oData.results[i].CurrencyKey;

								var obj = {
									Materialt: material,
									Descript: descrip,
									Uomt: uom,
									Plantt: plant,
									pricet: price,
									Currencyt: cur
								};
								arrayofmaterialdecs.push(obj);
								var oModelccd = new sap.ui.model.json.JSONModel({
									listdata: arrayofmaterialdecs
								});
								materialtable.setModel(oModelccd);
							}
							var titems1 = new sap.m.ColumnListItem({
								cells: [new sap.m.Text({
										text: "{Materialt}" //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Descript}" //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Uomt}" //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Plantt}",
										visible: false //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{pricet}",
										visible: false //"{itemkey}"
									}),
									new sap.m.Text({
										text: "{Currencyt}",
										visible: false //"{itemkey}"
									})

								]
							});

							materialtable.bindItems("/listdata", titems1);
						}
					}
				});
			},

			onSLocSelection: function (oEvent) {
				this.stloc = oEvent.getSource().getSelectedKey();
				var oFilters = [new sap.ui.model.Filter("ImWerks", sap.ui.model.FilterOperator.EQ, this.plantKey),
					new sap.ui.model.Filter("ImLgort", sap.ui.model.FilterOperator.EQ, this.stloc)
				];

				var oModel = new ODataModel('/sap/opu/odata/sap/ZPRJ_SD_APPS_SRV/');
				var sPath = "/MaterialF4Set";
				oModel.read(sPath, {
					filters: oFilters,
					success: function (oData, oResponse) {
						var Odatalength = (oData.results).length;
						this.getView().getModel("oGlobalModel").setSizeLimit(1000);
						this.getView().getModel("oGlobalModel").setProperty("/storageLoc", oData.results);
					}
				});

			},

			qtychange: function (oEvent) {

				var newValue = oEvent.getParameter("value");
				var oTable = this.byId("idTable");

				var oRow = oEvent.getSource().getParent(); //Get Row
				var oTable = oRow.getParent(); // Get Table
				var i = oTable.indexOfItem(oRow); //Get Row index
				// var qty = oTable.getItems()[i].getCells()[3].getValue();
				var netprice = oTable.getItems()[i].getCells()[2].getValue();

				var totprice = newValue * parseFloat(netprice);
				var totprice = totprice.toFixed(2);
				oTable.getItems()[i].getCells()[7].setValue(totprice);
				this.getView().byId("idamount").setValue(totprice);
				this.getView().byId("idqty").setValue(newValue)

			},

			onDialogOk: function () {

				var tabledet = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
				var select = tabledet.getSelectedItem();
				var tablelength = tabledet.getSelectedItems().length;
				console.log("TableLenth :", tablelength);
				for (var i = 0; i < tablelength; i++) {
					var rows = tabledet.getSelectedItems()[i];
					var Material = rows.getCells()[0].getText();
					var Matdes = rows.getCells()[1].getText();
					var uom = rows.getCells()[2].getText();
					var plant = rows.getCells()[3].getText();
					var price = rows.getCells()[4].getText();
					var curr = rows.getCells()[5].getText();
					//	var currency = rows.getCells()[4].getText();

					var table = this.dataModel.getProperty("/itemTable");

					table[this.valueHelpIndex].Empty2 = Material + "-" + Matdes;
					/*	table[this.valueHelpIndex].Empty3 = Matdes;*/ //amnt + " " + eCurrency
					table[this.valueHelpIndex].Empty4 = price;
					table[this.valueHelpIndex].Empty5 = curr;
					table[this.valueHelpIndex].Empty7 = uom;
					table[this.valueHelpIndex].Empty9 = plant;
					this.dataModel.refresh();

				}
				this.prc = plant;
				this.storageloc();
				this.table.close();
				this.deliverydetails();
				this.pricingconditionpo();
				tabledet.setVisible(false);
				sap.ui.core.Fragment.byId("tablefragment", "idFragPlant").setSelectedKey("");
				sap.ui.core.Fragment.byId("tablefragment", "materialType").setSelectedKey("");
				sap.ui.core.Fragment.byId("tablefragment", "materialDesc").setSelectedKey("");
			},

			pricingconditionpo: function () {
				var that = this;
				var tab2 = that.getView().byId("idEditTable");
				var lengthoffirst = tab2.getItems().length;
				var oFirstItem = tab2.getItems()[0];
				var NetPrice = oFirstItem.getCells()[2].getValue();
				var currency = oFirstItem.getCells()[3].getValue();
				var PRQuantity = oFirstItem.getCells()[4].getValue();
				var TotalValue = oFirstItem.getCells()[6].getValue();
				that.getView().byId("idcurrpo").setValue(currency);
				that.getView().byId("idpricepo").setValue(NetPrice);
				that.getView().byId("idamountpo").setValue(TotalValue);
				that.getView().byId("idqtypo").setValue(PRQuantity);
			},

			deliverydetails: function () {

				var oModel = new ODataModel("/sap/opu/odata/sap/ZMM_F4_SRV");
				var sPath = "/PlantDetailsSet('" + this.prc + "')";
				var oCont = this;
				oModel.read(sPath, {
					success: function (oData) {

						var name = oData.Name;
						var street = oData.HouseNoStreet;
						var district = oData.City;
						var country = oData.CountryKey;
						var postal = oData.PostalCode;
						oCont.getView().byId("idEditName").setValue(name);
						oCont.getView().byId("idEditStreet").setValue(street);
						oCont.getView().byId("idEditCountry").setValue(country);
						oCont.getView().byId("idEditDist").setValue(district);
						oCont.getView().byId("idEditPostalCode").setValue(postal);

					}
				});

				//this.storageloc();
			},

			storageloc: function () {
				var that = this;
				var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZPRJ_SD_APPS_SRV/', true);
				var sPaths = "/StorageLocF4Set?$filter=ImWerks eq  '" + this.prc + "'";
				oModel.read(sPaths, {
					success: function (oData, oResponse) {
						var length = (oData.results).length;
						//this.getView().getModel("oGlobalModel").setSizeLimit(1000);
						that.getView().getModel("oGlobalModel").setProperty("/sLocmanual", oData.results);
					},
				});

			},

			onCloseDialog2: function () {
				this.byId("fragLineItems").close();
			},
			calculation: function (oEvent) {
				var index = oEvent.getSource().getParent().getBindingContext("dataModel").sPath.split("/")[2];
				this.valueHelpIndex = index;

				var oTable = this.byId("idEditTable");
				var qty = oTable.getItems()[this.valueHelpIndex].getCells()[4].getValue();
				var price = oTable.getItems()[this.valueHelpIndex].getCells()[2].getValue();
				var mult = qty * price;
				mult = mult.toFixed(2);
				var table = this.dataModel.getProperty("/itemTable");
				table[this.valueHelpIndex].Empty8 = mult;

				this.getView().byId("idamount").setValue(mult);
				this.getView().byId("idqty").setValue(qty);

			},
			calculationprice: function () {
				var oTable = this.byId("idEditTable");
				var qty = oTable.getItems()[this.valueHelpIndex].getCells()[4].getValue();
				if (qty === "") {
					sap.m.MessageBox.confirm("Please Enter Quantity", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Warning",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === "OK") {

							}
						}.bind(this)
					});
				} else {
					var oTable = this.byId("idEditTable");
					var qty = oTable.getItems()[this.valueHelpIndex].getCells()[4].getValue();
					var price = oTable.getItems()[this.valueHelpIndex].getCells()[2].getValue();
					var mult = qty * price;
					mult = mult.toFixed(2);
					var table = this.dataModel.getProperty("/itemTable");
					table[this.valueHelpIndex].Empty8 = mult;

				}

			},

			ClearFilter: function () {

				var plant = sap.ui.core.Fragment.byId("tablefragment", "idFragPlant").setSelectedKey("");
				var materialtype = sap.ui.core.Fragment.byId("tablefragment", "materialType").setSelectedKey("");
				var materialdes = sap.ui.core.Fragment.byId("tablefragment", "materialDesc").setSelectedKey("");
				var tableres = sap.ui.core.Fragment.byId("tablefragment", "fragTable");
				tableres.destroyItems();

			},

			createPO: function () {

				if (this.check === "") {
					sap.m.MessageBox.confirm("Please select PO creation", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Warning",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === "OK") {}
						}.bind(this)
					});
				}
				/*With Refereal posting */
				if (this.check === "x") { ///  With reference PR
					var arryPrItems = [];
					var prCreation = this.byId("prCombo").getSelectedKey();
					if (prCreation == "") {

						sap.m.MessageBox.confirm("Please select the Reference PR to continue", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Warning",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === "OK") {}
							}.bind(this)
						});
					} else {
						var today = new Date();
						var dd = String(today.getDate()).padStart(2, '0');
						var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
						var yyyy = today.getFullYear();
						today = yyyy + '-' + mm + '-' + dd + 'T' + '00' + ':' + '00' + ':' + '00';

						var table = this.getView().byId("idTable");
						var rowItems = table.getSelectedItems();
						if (rowItems == "") {
							sap.m.MessageBox.confirm("Please select the Items to continue", {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Warning",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (oAction) {
									if (oAction === "OK") {}
								}.bind(this)
							});
						} else {
							var put1 = [];
							var docType = this.byId("idDocType").getValue();
							var compCode = this.byId("idCC").getValue();
							var purchOrg = this.byId("idPurOrg").getValue(); // Purchase Org
							var purchOrgd = this.byId("prpurchaseorg").getSelectedKey(); //Purchase Org dup
							var purchGrp = this.byId("idPurGrp").getValue(); // Purchase group
							var purchGrpd = this.byId("PRpurchasegrup").getSelectedKey(); // Purchase group dup
							var vendor = this.byId("idVendor").getValue(); // vendor
							var vendord = this.byId("prvendor").getSelectedKey(); // vendor dup
							var text = this.byId("idText").getValue();
							var deliverydate = this.byId("datepickpr").getValue();

							var table = this.byId("idTable");
							if (vendor === "" && vendord === "") {
								sap.m.MessageBox.confirm("Please Enter Vendor", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Warning",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {

										}
									}.bind(this)
								});
							} else if (purchOrg === "" && purchGrpd === "") {

								sap.m.MessageBox.confirm("Please Purchase Org", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Warning",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {

										}
									}.bind(this)
								});
							} else if (purchGrp === "" && purchGrpd === "") {
								sap.m.MessageBox.confirm("Please Enter Purchase Group", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Warning",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {

										}
									}.bind(this)
								});
							} else {

								var tablelength = table.getSelectedItems().length;
								var purchOrg = this.byId("prpurchaseorg").getSelectedKey(); //Purchase Org dup
								var purchGrp = this.byId("PRpurchasegrup").getSelectedKey(); // Purchase group dup
								var vendor = this.byId("prvendor").getSelectedKey(); // vendor dup
								for (var i = 0; i < tablelength; i++) {
									var rows = table.getSelectedItems()[i];

									var itemNo = rows.getCells()[0].getValue();
									var material = rows.getCells()[1].getValue();
									var netprice = rows.getCells()[2].getValue();
									var currency = rows.getCells()[3].getValue();
									var qty = rows.getCells()[4].getValue();
									var uom = rows.getCells()[5].getValue();
									var plant = rows.getCells()[6].getValue();
									var totamnt = rows.getCells()[7].getValue();

									var material = material.split("-");
									var materialnum = material[0];
									var materialdecs = material[1];
									console.log("materialnum :", materialnum)
									console.log("materialdecs :", materialdecs)

									//var purchOrg = purchOrgd;

									if (qty === "") {
										sap.m.MessageBox.confirm("Please Enter Quantity", {
											icon: sap.m.MessageBox.Icon.WARNING,
											title: "Warning",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (oAction) {
												if (oAction === "OK") {

												}
											}.bind(this)
										});
									} else {

										var prItemObj = {
											"PRItemNumber": itemNo,
											"MaterialNumberDes": "",
											"MaterialNumber": "",
											"Plant": "",
											"StorageLoc": "",
											"PRQuantity": qty,
											"Unit": "",
											"NetPrice": "",
											"ValuationPrice": "",
											"TotalValue": "",
											"Currency": "",
											"DeliveryDate": deliverydate

										};
										arryPrItems.push(prItemObj);
										console.log("tablelineitems", arryPrItems)
									} //else end
								} // for loop close

								var postdata = {

									"PRNumber": prCreation,
									"DocumentType": docType,
									"PurchaseOrg": purchOrg,
									"CompanyCode": "",
									"Vendor": vendor,
									"PurchaseGrp": purchGrp,
									"HeaderText": text,
									"ToItem": arryPrItems,
									"ToReturn": [{
										"Type": "",
										"Message": " ",
										"OutputNumber": ""
									}]
								};
								console.log(postdata);

								var oModel1 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_PO_CREATE_SRV/", true);
								this.resulttab = sap.ui.core.Fragment.byId("results", "tab3"); ///// For Table Message
								var that = this;
								var sPath = "/POHeaderSet";
								oModel1.create(sPath, postdata, {
									success: function (oData, oResponse) {

										console.log("Odata", oData)

										that.getView().getModel("oGlobalModel").setProperty("/tableresult", oData);
										that.getView().getModel("oGlobalModel").setProperty("/tableresult", oData.results);
										var tablen = oData.ToReturn.results.length;
										var msg = oData.ToReturn.results[0].Message;
										that.OutputNumber = oData.ToReturn.results[0].OutputNumber;
										sap.m.MessageBox.warning(msg + " ", {
											icon: sap.m.MessageBox.Icon.SUCCESS,
											title: "Success",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (Action) {
												if (Action === "OK") {
													window.location.reload();
												}
												// }.bind(this)
											}.bind(this)

										});

										var data = oData.ToReturn.results.map(function (item) { /// code for looping array value to store in variable
											if (item.Type === "I") {

												item.TypeText = "Information";

											} else if (item.Type === "S") {

												item.TypeText = "Success";
												that.OutputNumber = oData.ToReturn.results[0].OutputNumber;
												that.DMS();

											} else if (item.Type === "E") {

												item.TypeText = "Error";

											} else if (item.Type === "W") {

												item.TypeText = "Warning";

											}
											return item;
										});
										// that.result.open();
										// that.getView().getModel("oGlobalModel").setProperty("/result", data);

									}
								});
							}
						}
					}

				} else if (this.check === "y") { ///  Create manual po posting

					var ItemsM = [];
					var put1 = [];
					var docTypeM = this.byId("idEditDocType").getValue();
					var purchOrgM = this.byId("idEditOrg").getSelectedKey();

					var compCodeM = this.byId("idEditCompCode").getSelectedKey();
					var vendorM = this.byId("idEditVendor").getSelectedKey();
					var purchGrpM = this.byId("idEditPurGrp").getSelectedKey();

					var textM = this.byId("idEditTxt").getText();
					var deliverydate = this.byId("deliverydate").getValue();

					if (docTypeM === "") {
						sap.m.MessageBox.confirm("Please Enter Document type", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Warning",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === "OK") {

								}
							}.bind(this)
						});
					} else if (purchOrgM === "") {

						sap.m.MessageBox.confirm("Please Enter Purchase Org", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Warning",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === "OK") {

								}
							}.bind(this)
						});
					} else if (compCodeM === "") {
						sap.m.MessageBox.confirm("Please Enter Company Code", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Warning",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === "OK") {

								}
							}.bind(this)
						});
					} else if (vendorM === "") {
						sap.m.MessageBox.confirm("Please Enter Vendor", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Warning",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === "OK") {

								}
							}.bind(this)
						});
					} else if (purchGrpM === "") {
						sap.m.MessageBox.confirm("Please Enter Purchase Group", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Warning",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === "OK") {

								}
							}.bind(this)
						});
					} else {
						var tableM = this.byId("idEditTable");
						var tablelengthM = tableM.getItems().length;
						for (var j = 0; j < tablelengthM; j++) {
							var rowsM = tableM.getItems()[j];
							var itemNoM = rowsM.getCells()[0].getValue();
							var materialM = rowsM.getCells()[1].getValue();
							var priceM = rowsM.getCells()[2].getValue();
							var currencyM = rowsM.getCells()[3].getValue();
							var qtyM = rowsM.getCells()[4].getValue();
							var unitM = rowsM.getCells()[5].getValue();
							var totamountM = rowsM.getCells()[6].getValue();
							var plantM = rowsM.getCells()[7].getValue();

							var materialM = materialM.split("-");
							var materialMnum = materialM[0];
							var materialMdecs = materialM[1];
							console.log("materialnum :", materialMnum)
							console.log("materialdecs :", materialMdecs)

							if (materialMnum === "") {

								sap.m.MessageBox.confirm("Please Select Material", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Warning",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {

										}
									}.bind(this)
								});
							} else if (priceM === "") {
								sap.m.MessageBox.confirm("Please Enter NetPrice", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Warning",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {

										}
									}.bind(this)
								});
							} else if (qtyM === "") {
								sap.m.MessageBox.confirm("Please Enter Quantity", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Warning",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {

										}
									}.bind(this)
								});
							} else {
								var items = {
									"PRItemNumber": itemNoM,
									"MaterialNumberDes": "",
									"MaterialNumber": materialMnum,
									"Plant": plantM,
									"StorageLoc": "",
									"PRQuantity": qtyM,
									"Unit": "",
									"NetPrice": "",
									"ValuationPrice": "",
									"TotalValue": "",
									"Currency": "",
									"DeliveryDate": deliverydate
								};
								ItemsM.push(items);
							}

						}
						var postdataM = {
							"PRNumber": "",
							"DocumentType": "NB",
							"PurchaseOrg": purchOrgM,
							"CompanyCode": compCodeM,
							"Vendor": vendorM,
							"PurchaseGrp": purchGrpM,
							"HeaderText": textM,
							"ToReturn": [{
								"Type": "",
								"Message": " ",
								"OutputNumber": ""
							}],
							"ToItem": ItemsM

						};

						var oModel2 = new ODataModel("/sap/opu/odata/sap/ZMM_PO_CREATE_SRV/");
						this.resulttab = sap.ui.core.Fragment.byId("results", "tab3"); ///// For Table Message
						var that = this;
						var sPath = "/POHeaderSet";
						oModel2.create(sPath, postdataM, {
							success: function (oData, oResponse) {

								console.log("Odata", oData)

								that.getView().getModel("oGlobalModel").setProperty("/tableresult", oData);
								that.getView().getModel("oGlobalModel").setProperty("/tableresult", oData.results);
								var tablen = oData.ToReturn.results.length;
								var msg = oData.ToReturn.results[0].Message;
								that.OutputNumber = oData.ToReturn.results[0].OutputNumber;
								sap.m.MessageBox.warning(msg + " ", {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Success",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (Action) {
										if (Action === "OK") {
											window.location.reload();
										}
									}.bind(this)

								});

								var data = oData.ToReturn.results.map(function (item) { /// code for looping array value to store in variable
									if (item.Type === "I") {

										item.TypeText = "Information";

									} else if (item.Type === "S") {

										item.TypeText = "Success";
										that.OutputNumber = oData.ToReturn.results[0].OutputNumber;
										that.DMS();

									} else if (item.Type === "E") {

										item.TypeText = "Error";

									} else if (item.Type === "W") {

										item.TypeText = "Warning";

									}
									return item;
								});
								// that.result.open();
								// that.getView().getModel("oGlobalModel").setProperty("/result", data);

							},
							error: function (oData) {
								//	alert('Not Posted error')
							}
						});

					}
				}
			},
			tableok: function () { //This function closes the message fragment and makes the display confirmation visible

				var rowItems = sap.ui.core.Fragment.byId("results", "tab3").getItems();
				var tablength = rowItems.length;
				console.log("tablength", tablength);
				for (var i = 0; i < tablength; i++) {
					var item = rowItems[i];
					var Cells = item.getCells();
					var type = Cells[0].getText();
					if (type === "Success") {
						window.location.reload();

					} else if (type === "Error" || type === "Warning") {

					}
				}
				this.result.close();
			},
			handleMessagePopoverPress: function (oEvent) {
				this.oMessagePopover.toggle(oEvent.getSource());
			},

			onCancelPress: function () {
				sap.m.MessageBox.confirm("Are you sure to cancel ?", {
					//icon: sap.m.MessageBox.Icon.WARNING,
					title: "Confirmation",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === "YES") {
							window.location.reload();
						} else {

						}
					}.bind(this)
				});

			},

			/*---- DMS- Start -------*/

			DMS: function () {

				var that = this;
				//var descrip = that.byId("TypeHere1").getText();
				var descrip = that.byId("TypeHere1").getValue();
				that.ci_att1Post = that.getView().getModel("oGlobalModel").getProperty("/ci_att1");
				var oUploadCollection = that.getView().byId("UploadCollection");
				var user = parent.sap.ushell.Container.getUser().getId();

				that.arr142 = [];
				that.arrp = [];
				var count = that.ci_att1Post.length;

				for (var i = 0; i < count; i++) {
					var dmsdata = {
						"DocType": that.ci_att1Post[i].Ext,
						"FileName": that.ci_att1Post[i].Name,
						"Base64": that.ci_att1Post[i].Base64

					};
					that.arr142.push(dmsdata);
				}
				var obj = {
					"d": {
						"ProcessName": "Create PO", //WorkOrder
						"Description": descrip, // longtext
						"Username": user, //Login User
						"NotificationNo": that.OutputNumber,
						"To_DMSItems": that.arr142
					}
				};
				that.arrp.push(obj);
				// debugger;

				var oModel142 = new ODataModel("/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/", true);
				var sPath = "/DMS_HeaderSet";

				oModel142.create(sPath, obj, {
					success: function (oData, oResponse) {

						var msg = oData.ReturnMessage;
						// debugger;
						var typ = oData.ReturnType;

						if (typ == "S") {

							MessageToast.show(msg);
						} else {
							MessageToast.show(msg);
						}

					},
					error: function (oData, oResponse) {
						MessageToast.show("Service URL Error");
					}

				});

			}

			/*------DMS END------*/

		});
	},
	/* bExport= */
	true);