import { createAsyncThunk, createAction } from "@reduxjs/toolkit";

export default (
	type,
	payloadCreator,
	{
		mode = "preferAll", // preferLatest, preferAll, preferEarlier
		reset = false,
		storeKeyName,
		CRUDMode = "create", // create, update, delete
		multipleResources = false,
		entityAdapter,
		...options
	}
) => {
	const actions = asyncAction(type);
	const key = `${CRUDMode}Tracker${type}`;
	const intermediate = createAsyncThunk(
		type,
		(arg, thunkAPI) =>
			Promise.resolve(payloadCreator(arg, thunkAPI)).finally((_) => {
				if (reset)
					setTimeout(
						() => thunkAPI.dispatch(actions.reset(arg, thunkAPI.requestId)),
						reset * 1000
					);
				return _;
			}),
		options
	);
	const getNode = (state, resourceID) => {
		if (resourceID && multipleResources) {
			return [state[key], resourceID];
		}
		return [state, key];
	};
	intermediate.toString = () => key
	intermediate.reducers = {
		[intermediate.pending]: (
			state,
			{
				meta: {
					arg: { resourceID },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = { pending: true };
		},
		[intermediate.rejected]: (
			state,
			{
				error,
				meta: {
					arg: { resourceID },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = error;
		},
		[intermediate.reset]: (
			state,
			{
				meta: {
					arg: { resourceID },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = {};
		},
	};

	if (CRUDMode === "create") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceID, metaData = {}, body = {} },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = payload;
			entityAdapter.addOne(state, {
				...body,
				...metaData,
				...payload,
			});
		};
	} else if (CRUDMode === "update") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceID, metaData = {}, body = {} },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = payload;
			entityAdapter.updateOne(state, {
				...body,
				...metaData,
				...payload,
			});
		};
	} else if (CRUDMode === "delete") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceID },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = payload;
			entityAdapter.removeOne(state, resourceID);
		};
	} else if (CRUDMode === "readAll") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceID, metaData = {} },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = payload;
			entityAdapter.setAll(state, payload.entities);
		};
	} else if (CRUDMode === "readOne") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceID, metaData = {}, body = {} },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceID);
			node[key] = payload;
			state.selectedEntityId = entityAdapter.selectId(payload);
			entityAdapter.addOne(state, {
				...body,
				...metaData,
				...payload,
			});
		};
	}
	return intermediate
};

const asyncAction = (type) => {
	const names = (type) => ({
		reset: `${type}/reset`,
	});
	const types = names(type);
	return {
		reset: createAction(types.reset, (arg, requestId, resourceId) => {
			return {
				meta: { arg, requestId, resourceId },
			};
		}),
	};
};
const snakeToCamel = (str) =>
	str
		.toLowerCase()
		.replace(/.+__/, "")
		.replace(/([-_][a-z])/g, (group) =>
			group.toUpperCase().replace("-", "").replace("_", "")
		);
