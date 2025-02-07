"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFirebaseTable = exports.getFirebaseMenuItems = exports.getFirebaseOrdersForTable = exports.setFirebaseTableToOccupied = exports.updateFirebaseOrder = exports.updateFirebaseTable = exports.onFirebaseOrdersChange = exports.onFirebaseTablesChange = exports.addFirebaseOrder = exports.clearFirebaseTables = void 0;
var supabaseClient_1 = require("./supabaseClient");
var firestore_1 = require("firebase/firestore");
var clearFirebaseTables = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, tablesCollection, querySnapshot, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                tablesCollection = (0, firestore_1.collection)(db, 'tables');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, firestore_1.getDocs)(tablesCollection)];
            case 2:
                querySnapshot = _a.sent();
                querySnapshot.forEach(function (document) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(document.data().id !== 0)) return [3 /*break*/, 2];
                                return [4 /*yield*/, (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'tables', document.id))];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); });
                console.log("Successfully cleared all tables in Firebase");
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("Error clearing tables:", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.clearFirebaseTables = clearFirebaseTables;
var addFirebaseOrder = function (tableOrder, source) { return __awaiter(void 0, void 0, void 0, function () {
    var db, docRef, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Adding order to Firebase:", tableOrder);
                console.log("tableOrder data:", tableOrder); // Log tableOrder data
                console.log("tableOrder.items (JSON):", JSON.stringify(tableOrder.items)); // Log items as JSON string
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'orders'), {
                        tableId: tableOrder.tableId,
                        responsibleName: tableOrder.responsibleName,
                        items: JSON.stringify(tableOrder.items), // Store items as JSON
                        total: tableOrder.total,
                        timestamp: tableOrder.timestamp,
                        status: tableOrder.status, // Add status here
                        id: tableOrder.id,
                        source: source,
                        paymentMethod: tableOrder.paymentMethod, // Include paymentMethod
                    })];
            case 2:
                docRef = _a.sent();
                console.log("Document written with ID: ", docRef.id);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error("Error adding order:", error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addFirebaseOrder = addFirebaseOrder;
var onFirebaseTablesChange = function (callback) {
    var db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
    var tablesCollection = (0, firestore_1.collection)(db, 'tables');
    var unsubscribe = (0, firestore_1.onSnapshot)(tablesCollection, function (querySnapshot) {
        var tables = [];
        querySnapshot.forEach(function (doc) {
            tables.push(doc.data());
        });
        callback(tables);
        console.log("Firebase tables data updated!"); // Log Firebase update
    }, function (error) {
        console.error("Error fetching tables from Firebase:", error);
    });
    return unsubscribe;
};
exports.onFirebaseTablesChange = onFirebaseTablesChange;
var onFirebaseOrdersChange = function (callback) {
    var db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
    var ordersCollection = (0, firestore_1.collection)(db, 'orders');
    var unsubscribe = (0, firestore_1.onSnapshot)(ordersCollection, function (querySnapshot) {
        querySnapshot.docChanges().forEach(function (change) {
            if (change.type === "added" || change.type === "modified" || change.type === "removed") {
                console.log("Firebase order data changed:", change);
                callback(change); // Pass the change object to the callback
            }
        });
        console.log("Firebase orders data updated!"); // Log Firebase update
    }, function (error) {
        console.error("Error fetching orders from Firebase:", error);
    });
    return unsubscribe;
};
exports.onFirebaseOrdersChange = onFirebaseOrdersChange;
var updateFirebaseTable = function (tableId, newStatus) { return __awaiter(void 0, void 0, void 0, function () {
    var db, tableDocRef, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                tableDocRef = (0, firestore_1.doc)(db, 'tables', String(tableId));
                return [4 /*yield*/, (0, firestore_1.updateDoc)(tableDocRef, { status: newStatus })];
            case 2:
                _a.sent();
                console.log("Successfully updated table in Firebase");
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error("Error updating table:", error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateFirebaseTable = updateFirebaseTable;
var updateFirebaseOrder = function (orderId, newStatus) { return __awaiter(void 0, void 0, void 0, function () {
    var db, orderDocRef, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                orderDocRef = (0, firestore_1.doc)(db, 'orders', orderId);
                return [4 /*yield*/, (0, firestore_1.updateDoc)(orderDocRef, { status: newStatus })];
            case 2:
                _a.sent();
                console.log("Successfully updated order in Firebase");
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error("Error updating order:", error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateFirebaseOrder = updateFirebaseOrder;
var setFirebaseTableToOccupied = function (tableId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, tableDocRef, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                tableDocRef = (0, firestore_1.doc)(db, 'tables', String(tableId));
                return [4 /*yield*/, (0, firestore_1.updateDoc)(tableDocRef, { status: "occupied" })];
            case 2:
                _a.sent();
                console.log("Successfully set table to occupied in Firebase");
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.error("Error setting table to occupied:", error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.setFirebaseTableToOccupied = setFirebaseTableToOccupied;
var getFirebaseOrdersForTable = function (tableId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, ordersCollection, q, querySnapshot, orders_1, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                ordersCollection = (0, firestore_1.collection)(db, 'orders');
                q = (0, firestore_1.query)(ordersCollection, (0, firestore_1.where)('tableId', '==', tableId));
                return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
            case 2:
                querySnapshot = _a.sent();
                orders_1 = [];
                querySnapshot.forEach(function (doc) {
                    orders_1.push(doc.data());
                });
                console.log("Successfully fetched orders for table from Firebase");
                return [2 /*return*/, orders_1];
            case 3:
                error_6 = _a.sent();
                console.error("Error fetching orders for table:", error_6);
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getFirebaseOrdersForTable = getFirebaseOrdersForTable;
var getFirebaseMenuItems = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, menuItemsCollection, querySnapshot, menuItems_1, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                menuItemsCollection = (0, firestore_1.collection)(db, 'menu_items');
                return [4 /*yield*/, (0, firestore_1.getDocs)(menuItemsCollection)];
            case 2:
                querySnapshot = _a.sent();
                menuItems_1 = [];
                querySnapshot.forEach(function (doc) {
                    menuItems_1.push(doc.data());
                });
                console.log("Successfully fetched menu items from Firebase");
                return [2 /*return*/, menuItems_1];
            case 3:
                error_7 = _a.sent();
                console.error("Error fetching menu items:", error_7);
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getFirebaseMenuItems = getFirebaseMenuItems;
var addFirebaseTable = function (tableData) { return __awaiter(void 0, void 0, void 0, function () {
    var db, docRef, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = (0, firestore_1.getFirestore)(supabaseClient_1.default);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'tables'), tableData)];
            case 2:
                docRef = _a.sent();
                console.log("Successfully added table to Firebase with ID: ", docRef.id);
                return [2 /*return*/, { data: __assign(__assign({}, tableData), { id: docRef.id }) }]; // Return similar data structure
            case 3:
                error_8 = _a.sent();
                console.error("Error adding table:", error_8);
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addFirebaseTable = addFirebaseTable;
