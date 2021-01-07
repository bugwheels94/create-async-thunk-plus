import { createAsyncThunk, createAction } from "@reduxjs/toolkit";

export default (
	type,
	payloadCreator,
	{
		mode = "preferAll", // preferLatest, preferAll, preferEarlier
		reset = false,
		CRUDMode = "create", // create, update, delete
		multipleResources = false,
		entityAdapter,
		selectId, // if entityAdapter is missing
		...options
	} = {}
) => {
	const actions = asyncAction(type);
	const key = `${CRUDMode}Tracker${type}`;
	let idSelector = selectId || entityAdapter && entityAdapter.selectId || (() => "id");
	const intermediate = createAsyncThunk(
		type,
		(arg, thunkAPI) =>
			Promise.resolve(payloadCreator(arg, thunkAPI)).finally((_) => {
				if (reset)
					setTimeout(() => thunkAPI.dispatch(actions.reset(arg, thunkAPI.requestId)), reset * 1000);
				return _;
			}),
		options
	);
	const getNode = (state, thunkArgument) => {
		if (multipleResources) {
			state[key] = state[key] || {};
			const id = idSelector(thunkArgument);
			return [state[key], id];
		}
		return [state, key];
	};
	intermediate.toString = () => key;
	intermediate.reducers = {
		[intermediate.pending]: (state, { meta: { arg } }) => {
			const [node, key] = getNode(state, arg);
			node[key] = { pending: true };
		},
		[intermediate.rejected]: (state, { error, meta: { arg = {} } }) => {
			const [node, key] = getNode(state, arg);
			node[key] = { error };
		},
		[intermediate.reset]: (state, { meta: { arg = {} } }) => {
			const [node, key] = getNode(state, arg);
			node[key] = {};
		},
	};

	// Fulfilled Handler needs to be different
	if (CRUDMode === "create") {
		intermediate.reducers[intermediate.fulfilled] = (state, { payload, meta: { arg = {} } }) => {
			const { metaData = {}, body = {} } = arg;
			const [node, key] = getNode(state);
			const entity = {
				...body,
				...metaData,
				...payload,
			};
			node[key] = {
				fulfilled: true,
				entity,
			};
			entityAdapter && entityAdapter.addOne(state, entity);
		};
	} else if (CRUDMode === "update") {
		intermediate.reducers[intermediate.fulfilled] = (state, { payload, meta: { arg = {} } }) => {
			const [node, key] = getNode(state, arg);
			const { metaData = {}, body = {} } = arg;
			const id = idSelector(arg);
			const previousObject = entityAdapter
				? entityAdapter.getSelectors().selectById(state, id)
				: node[key]; // single value in store
			const entity = {
				...(previousObject || {}),
				changes: {
					...body,
					...metaData,
					...payload,
				},
			};
			node[key] = {
				fulfilled: true,
				entity,
			};
			entityAdapter && entityAdapter.updateOne(state, entity);
		};
	} else if (CRUDMode === "upsert") {
		intermediate.reducers[intermediate.fulfilled] = (state, { payload, meta: { arg = {} } }) => {
			const [node, key] = getNode(state, arg);
			const { metaData = {}, body = {} } = arg;
			const id = idSelector(arg);
			const previousObject = entityAdapter
				? entityAdapter.getSelectors().selectById(state, id)
				: node[key]; // single value in store
			const entity = {
				...(previousObject || {}),
				...body,
				...metaData,
				...payload,
			};
			node[key] = {
				fulfilled: true,
				entity,
			};
			entityAdapter && entityAdapter.upsertOne(state, entity);
		};
	} else if (CRUDMode === "remove") {
		intermediate.reducers[intermediate.fulfilled] = (state, { meta: { arg = {} } }) => {
			const [node, key] = getNode(state, arg);
			node[key] = {
				fulfilled: true,
			};
			entityAdapter && entityAdapter.removeOne(state, idSelector(arg));
		};
	} else if (CRUDMode === "readAll") {
		intermediate.reducers[intermediate.fulfilled] = (state, { payload }) => {
			const [node, key] = getNode(state);
			node[key] = {
				fulfilled: true,
				payload: payload.metaData,
			};
			entityAdapter && entityAdapter.setAll(state, payload.entities);
		};
	} else if (CRUDMode === "readOne") {
		intermediate.reducers[intermediate.fulfilled] = (state, { payload, meta: { arg = {} } }) => {
			const { metaData = {}, body = {} } = arg;
			const [node, key] = getNode(state, arg);
			const entity = {
				...body,
				...metaData,
				...payload,
			};
			node[key] = {
				fulfilled: true,
				entity,
			};
			if (!entityAdapter) return;
			state.selectedEntityId = idSelector(payload);
			entityAdapter.addOne(state, entity);
		};
	} else if (CRUDMode === "readHeader") {
		intermediate.reducers[intermediate.fulfilled] = (state, { payload, meta: { arg = {} } }) => {
			const [node, key] = getNode(state, arg);
			node[key] = {
				fulfilled: true,
			};
		};
	} else { // no CRUD mode
		intermediate.reducers[intermediate.fulfilled] = (state, { payload, meta: { arg = {} } }) => {
			const [node, key] = getNode(state);
			node[key] = {
				fulfilled: true,
			};
		};
	}
	return intermediate;
};

const asyncAction = (type) => {
	const names = (type) => ({
		reset: `${type}/reset`,
	});
	const types = names(type);
	return {
		reset: createAction(types.reset, (arg, requestId) => {
			return {
				meta: { arg, requestId },
			};
		}),
	};
};
