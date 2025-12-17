require("dotenv").config();
const axios = require("axios");

const SOURCE_ENUM = {
  google: 1,
  "fb-insta": 2,
  "custom-p": 5,
  "google-p": 6,
};

class KeyCrm {
  constructor() {
    this.TOKEN_KEY_CRM = process.env.TOKEN_KEY_CRM;
    this.BASE_URL_KEY_CRM = "https://openapi.keycrm.app";
  }

  async sendPipe(contact, message = undefined, utm = undefined) {
    try {
      const { name, phone } = contact;
      const bodyCRM = {
        contact: {
          full_name: name,
          phone,
        },
      };

      if (message) bodyCRM.manager_comment = message;
      if (utm) {
        Object.entries(utm).forEach(([key, value]) => {
          if (value) bodyCRM[key] = value;
        });
        if (SOURCE_ENUM[utm.utm_source])
          bodyCRM.source_id = SOURCE_ENUM[utm.utm_source];
      }
      const { data } = await axios.post("/v1/pipelines/cards", bodyCRM, {
        baseURL: this.BASE_URL_KEY_CRM,
        headers: {
          Authorization: `Bearer ${this.TOKEN_KEY_CRM}`,
        },
      });
      console.log(data);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

module.exports = new KeyCrm();
