var Models = {};

Models.RawVideo = can.Model({
    findAll: 'GET /fido/api/rawVideo',
    findOne: 'GET /fido/api/rawVideo/{id}'
}, {});

Models.Encoder = can.Model({
	findAll: 'GET /fido/api/encode',
	create: 'POST /fido/api/encode'
}, {});

Models.QC = can.Model({
    findAll: 'GET /fido/api/qc',
    findOne: 'GET /fido/api/qc/{id}'
}, {});

Models.Media = can.Model({
    findAll: 'GET /fido/api/media'
}, {});