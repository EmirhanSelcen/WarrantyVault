const serviceRecordService = require("../services/serviceRecordService");

async function list(req, res, next) {
  try {
    const records = await serviceRecordService.listServiceRecords(req.user.id, req.query.productId);
    res.json(records);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const record = await serviceRecordService.createServiceRecord(req.user.id, req.body);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await serviceRecordService.deleteServiceRecord(req.user.id, Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, remove };
