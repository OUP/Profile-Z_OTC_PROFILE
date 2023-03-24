sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
  let _sBtnId;
  ("use strict");
  return {
    onInit: function () {
      // attach page data loaded on odata callback with context as response
      this.extensionAPI.attachPageDataLoaded((_) => {
        // hide bopf delete button
        const sViewId = this.getView().getId();
        const bProfilePage = /ZOTC_C_PROFILE$/g.test(sViewId);
        
        if(!bProfilePage) return;

        sap.ui.getCore().byId(`${sViewId}--delete`).setVisible(false);
      });
    },

    onDeletePress: function (_) {
      const oModel = this.getView().getModel();
      const oData = this.getView().getBindingContext().getObject();
      const success = (_) => {
        MessageBox.success(`Profile '${oData.profile}' deleted successfully`, {
          onClose: (_) => {
            window.history.go(-1);
          },
        });
      };
      const error = (oErrorResponse) => {
        let sErrorMsg = `Error is deleting the profile '${oData.profile}'`;
        try {
          const oResponseText = JSON.parse(oErrorResponse.responseText);
          sErrorMsg = oResponseText.error.message.value;
        } catch (error) {
          // failed to read actual error message from odata response
        }
        // display error message
        MessageBox.error(sErrorMsg);
      };
      const urlParameters = {
        profile_uuid: oData.profile_uuid,
        IsActiveEntity: oData.IsActiveEntity,
      };

      // trigger odata delete action call
      oModel.callFunction("/ZOTC_C_PROFILEDeleteprofile", {
        method: "POST",
        urlParameters,
        success,
        error,
      });
    },
  };
});
