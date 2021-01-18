"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toolkit = require("@reduxjs/toolkit");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var _default = function _default(type, payloadCreator) {
  var _intermediate$reducer;

  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mode = _ref.mode,
      mode = _ref$mode === void 0 ? "preferAll" : _ref$mode,
      _ref$reset = _ref.reset,
      reset = _ref$reset === void 0 ? false : _ref$reset,
      _ref$CRUDMode = _ref.CRUDMode,
      CRUDMode = _ref$CRUDMode === void 0 ? "create" : _ref$CRUDMode,
      _ref$multipleResource = _ref.multipleResources,
      multipleResources = _ref$multipleResource === void 0 ? false : _ref$multipleResource,
      entityAdapter = _ref.entityAdapter,
      selectId = _ref.selectId,
      options = _objectWithoutProperties(_ref, ["mode", "reset", "CRUDMode", "multipleResources", "entityAdapter", "selectId"]);

  var actions = asyncAction(type);
  var key = "".concat(CRUDMode, "Tracker").concat(type);

  var idSelector = selectId || entityAdapter && entityAdapter.selectId || function () {
    return "id";
  };

  var intermediate = (0, _toolkit.createAsyncThunk)(type, function (arg, thunkAPI) {
    return Promise.resolve(payloadCreator(arg, thunkAPI))["finally"](function (_) {
      if (reset) setTimeout(function () {
        return thunkAPI.dispatch(actions.reset(arg, thunkAPI.requestId));
      }, reset * 1000);
      return _;
    });
  }, options);

  var getNode = function getNode(state, thunkArgument) {
    if (multipleResources) {
      state[key] = state[key] || {};
      var id = idSelector(thunkArgument);
      return [state[key], id];
    }

    return [state, key];
  };

  intermediate.toString = function () {
    return key;
  };

  intermediate.reducers = (_intermediate$reducer = {}, _defineProperty(_intermediate$reducer, intermediate.pending, function (state, _ref2) {
    var arg = _ref2.meta.arg;

    var _getNode = getNode(state, arg),
        _getNode2 = _slicedToArray(_getNode, 2),
        node = _getNode2[0],
        key = _getNode2[1];

    node[key] = {
      pending: true
    };
  }), _defineProperty(_intermediate$reducer, intermediate.rejected, function (state, _ref3) {
    var error = _ref3.error,
        _ref3$meta$arg = _ref3.meta.arg,
        arg = _ref3$meta$arg === void 0 ? {} : _ref3$meta$arg;

    var _getNode3 = getNode(state, arg),
        _getNode4 = _slicedToArray(_getNode3, 2),
        node = _getNode4[0],
        key = _getNode4[1];

    node[key] = {
      error: error
    };
  }), _defineProperty(_intermediate$reducer, intermediate.reset, function (state, _ref4) {
    var _ref4$meta$arg = _ref4.meta.arg,
        arg = _ref4$meta$arg === void 0 ? {} : _ref4$meta$arg;

    var _getNode5 = getNode(state, arg),
        _getNode6 = _slicedToArray(_getNode5, 2),
        node = _getNode6[0],
        key = _getNode6[1];

    node[key] = {};
  }), _intermediate$reducer); // Fulfilled Handler needs to be different

  if (CRUDMode === "create") {
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref5) {
      var payload = _ref5.payload,
          _ref5$meta$arg = _ref5.meta.arg,
          arg = _ref5$meta$arg === void 0 ? {} : _ref5$meta$arg;
      var _arg$metaData = arg.metaData,
          metaData = _arg$metaData === void 0 ? {} : _arg$metaData,
          _arg$body = arg.body,
          body = _arg$body === void 0 ? {} : _arg$body;

      var _getNode7 = getNode(state),
          _getNode8 = _slicedToArray(_getNode7, 2),
          node = _getNode8[0],
          key = _getNode8[1];

      var entity = _objectSpread(_objectSpread(_objectSpread({}, body), metaData), payload);

      node[key] = {
        fulfilled: true,
        entity: entity
      };
      entityAdapter && entityAdapter.addOne(state, entity);
    };
  } else if (CRUDMode === "update") {
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref6) {
      var payload = _ref6.payload,
          _ref6$meta$arg = _ref6.meta.arg,
          arg = _ref6$meta$arg === void 0 ? {} : _ref6$meta$arg;

      var _getNode9 = getNode(state, arg),
          _getNode10 = _slicedToArray(_getNode9, 2),
          node = _getNode10[0],
          key = _getNode10[1];

      var _arg$metaData2 = arg.metaData,
          metaData = _arg$metaData2 === void 0 ? {} : _arg$metaData2,
          _arg$body2 = arg.body,
          body = _arg$body2 === void 0 ? {} : _arg$body2;
      var id = idSelector(arg);
      var previousObject = entityAdapter ? entityAdapter.getSelectors().selectById(state, id) : node[key]; // single value in store

      var entity = _objectSpread(_objectSpread({}, previousObject || {}), {}, {
        changes: _objectSpread(_objectSpread(_objectSpread({}, body), metaData), payload)
      });

      node[key] = {
        fulfilled: true,
        entity: entity
      };
      entityAdapter && entityAdapter.updateOne(state, entity);
    };
  } else if (CRUDMode === "upsert") {
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref7) {
      var payload = _ref7.payload,
          _ref7$meta$arg = _ref7.meta.arg,
          arg = _ref7$meta$arg === void 0 ? {} : _ref7$meta$arg;

      var _getNode11 = getNode(state, arg),
          _getNode12 = _slicedToArray(_getNode11, 2),
          node = _getNode12[0],
          key = _getNode12[1];

      var _arg$metaData3 = arg.metaData,
          metaData = _arg$metaData3 === void 0 ? {} : _arg$metaData3,
          _arg$body3 = arg.body,
          body = _arg$body3 === void 0 ? {} : _arg$body3;
      var id = idSelector(arg);
      var previousObject = entityAdapter ? entityAdapter.getSelectors().selectById(state, id) : node[key]; // single value in store

      var entity = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, previousObject || {}), body), metaData), payload);

      node[key] = {
        fulfilled: true,
        entity: entity
      };
      entityAdapter && entityAdapter.upsertOne(state, entity);
    };
  } else if (CRUDMode === "remove") {
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref8) {
      var _ref8$meta$arg = _ref8.meta.arg,
          arg = _ref8$meta$arg === void 0 ? {} : _ref8$meta$arg;

      var _getNode13 = getNode(state, arg),
          _getNode14 = _slicedToArray(_getNode13, 2),
          node = _getNode14[0],
          key = _getNode14[1];

      node[key] = {
        fulfilled: true
      };
      entityAdapter && entityAdapter.removeOne(state, idSelector(arg));
    };
  } else if (CRUDMode === "readAll") {
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref9) {
      var payload = _ref9.payload;

      var _getNode15 = getNode(state),
          _getNode16 = _slicedToArray(_getNode15, 2),
          node = _getNode16[0],
          key = _getNode16[1];

      node[key] = {
        fulfilled: true,
        payload: payload.entities
      };
      entityAdapter && entityAdapter.setAll(state, payload.entities);
    };
  } else if (CRUDMode === "readOne") {
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref10) {
      var payload = _ref10.payload,
          _ref10$meta$arg = _ref10.meta.arg,
          arg = _ref10$meta$arg === void 0 ? {} : _ref10$meta$arg;
      var _arg$metaData4 = arg.metaData,
          metaData = _arg$metaData4 === void 0 ? {} : _arg$metaData4;

      var _getNode17 = getNode(state, arg),
          _getNode18 = _slicedToArray(_getNode17, 2),
          node = _getNode18[0],
          key = _getNode18[1];

      var entity = _objectSpread(_objectSpread({}, metaData), payload);

      node[key] = {
        fulfilled: true,
        entity: entity
      };
      if (!entityAdapter) return;
      state.selectedEntityId = idSelector(payload);
      entityAdapter.addOne(state, entity);
    };
  } else if (CRUDMode === "readHeader") {
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref11) {
      var _ref11$meta$arg = _ref11.meta.arg,
          arg = _ref11$meta$arg === void 0 ? {} : _ref11$meta$arg;

      var _getNode19 = getNode(state, arg),
          _getNode20 = _slicedToArray(_getNode19, 2),
          node = _getNode20[0],
          key = _getNode20[1];

      node[key] = {
        fulfilled: true
      };
    };
  } else {
    // no CRUD mode
    intermediate.reducers[intermediate.fulfilled] = function (state, _ref12) {
      var payload = _ref12.payload,
          _ref12$meta$arg = _ref12.meta.arg,
          arg = _ref12$meta$arg === void 0 ? {} : _ref12$meta$arg;

      var _getNode21 = getNode(state, arg),
          _getNode22 = _slicedToArray(_getNode21, 2),
          node = _getNode22[0],
          key = _getNode22[1];

      node[key] = {
        fulfilled: true,
        payload: payload
      };
    };
  }

  return intermediate;
};

exports["default"] = _default;

var asyncAction = function asyncAction(type) {
  var names = function names(type) {
    return {
      reset: "".concat(type, "/reset")
    };
  };

  var types = names(type);
  return {
    reset: (0, _toolkit.createAction)(types.reset, function (arg, requestId) {
      return {
        meta: {
          arg: arg,
          requestId: requestId
        }
      };
    })
  };
};