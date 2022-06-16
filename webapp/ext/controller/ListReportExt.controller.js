sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
  "use strict";
  return {
    onInit: function () {
      const oModel = this.getOwnerComponent().getModel();

      //Set deferred groups and create Function Imports
      oModel.setDeferredGroups(["batchFunctionImport"]);
    },
    onDeletePress: function (oEvent) {
      const sViewId = this.getView().getId();
      const sTableId = sViewId + "--responsiveTable";
      const oTable = sap.ui.getCore().byId(sTableId);
      const aSelectedContext = oTable.getSelectedContexts();
      const oModel = this.getView().getModel();
      const aProfile = [];

      for (let i = 0, iLen = aSelectedContext.length; i < iLen; i++) {
        const oData = aSelectedContext[i].getObject();
        const urlParameters = {
          profile_uuid: oData.profile_uuid,
          IsActiveEntity: oData.IsActiveEntity,
        };
        aProfile.push(i + 1 + ". " + oData.profile);

        // trigger odata delete action call
        oModel.callFunction("/ZOTC_C_PROFILEDeleteprofile", {
          method: "POST",
          urlParameters,
          batchGroupId: "batchFunctionImport",
          changeSetId: i,
        });
      }

      const success = (oSuccessResponse) => {
        debugger;
        const aBatchResponses = oSuccessResponse.__batchResponses;
        let bError = false;
        let sErrorMsg = "";
        let aErrorMsg = [];

        // check response type
        if (aBatchResponses[0].response) {
          for (const [i, oBatch] of aBatchResponses.entries()) {
            if (parseInt(oBatch.response.statusCode) >= 400) {
              bError = true;
            }
            sErrorMsg = JSON.parse(oBatch.response.body).error.message.value;
            aErrorMsg.push(i + 1 + ". " + sErrorMsg);
          }
        }

        if (bError) {
          // display error message
          MessageBox.error(aErrorMsg.join("\n\n"));
        } else {
          MessageBox.success(
            `Profile deleted successfully\n\n${aProfile.join("\n")}`
          );

          // refresh list
          oModel.refresh();
        }
      };

      const error = (_) => {
        // display error message
        MessageBox.error("Unable to process request due to technical issue");
      };

      // submitting the function import batch call
      oModel.submitChanges({
        batchGroupId: "batchFunctionImport",
        success,
        error,
      });
    },
  };
});
