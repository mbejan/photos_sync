const { Client: Client6 } = require('@elastic/elasticsearch')


class GPhotosES {
  
    constructor() {
        this.client6 = new Client6({ node: 'http://search-gphotos-vjsr4xuyfr4zoyt6i23r5mubam.ap-southeast-2.es.amazonaws.com/' })
        this.client6.info(console.log);
    }

}

module.exports = GPhotosES;