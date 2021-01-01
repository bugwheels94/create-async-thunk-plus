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
					setTimeout(() => thunkAPI.dispatch(actions.reset(arg, thunkAPI.requestId)), reset * 1000);
				return _;
			}),
		options
	);
	const getNode = (state, resourceId) => {
		if (resourceId && multipleResources) {
			state[key] = state[key] || {};
			return [state[key], resourceId];
		}
		return [state, key];
	};
	intermediate.toString = () => key;
	intermediate.reducers = {
		[intermediate.pending]: (
			state,
			{
				meta: {
					arg: { resourceId },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceId);
			node[key] = { pending: true };
		},
		[intermediate.rejected]: (
			state,
			{
				error,
				meta: {
					arg: { resourceId },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceId);
			node[key] = { error };
		},
		[intermediate.reset]: (
			state,
			{
				meta: {
					arg: { resourceId },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceId);
			node[key] = {};
		},
	};

	// Fulfilled Handler needs to be different
	if (CRUDMode === "create") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { metaData = {}, body = {} } = {},
				},
			}
		) => {
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
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceId, metaData = {}, body = {} } = {},
				},
			}
		) => {
			const [node, key] = getNode(state, resourceId);
			const previousObject = entityAdapter
				? entityAdapter.getSelectors().selectById(state, resourceId)
				: node[key];	// single value in store
			const entity = {
				...previousObject,
				...body,
				...metaData,
				...payload,
			};
			node[key] = {
				fulfilled: true,
				entity,
			};
			entityAdapter && entityAdapter.updateOne(state, entity);
		};
	} else if (CRUDMode === "remove") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceId },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceId);
			node[key] = {
				fulfilled: true,
				payload,
			};
			entityAdapter && entityAdapter.removeOne(state, resourceId);
		};
	} else if (CRUDMode === "readAll") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
			}
		) => {
			const [node, key] = getNode(state);
			node[key] = {
				fulfilled: true,
				payload: payload.metaData,
			};
			entityAdapter && entityAdapter.setAll(state, payload.entities);
		};
	} else if (CRUDMode === "readOne") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceId, metaData = {}, body = {} },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceId);
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
			state.selectedEntityId = entityAdapter.selectId(payload);
			entityAdapter.addOne(state, entity);
		};
	} else if (CRUDMode === "readHeader") {
		intermediate.reducers[intermediate.fulfilled] = (
			state,
			{
				payload,
				meta: {
					arg: { resourceId, metaData = {}, body = {} },
				},
			}
		) => {
			const [node, key] = getNode(state, resourceId);
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
		reset: createAction(types.reset, (arg, requestId, resourceId) => {
			return {
				meta: { arg, requestId, resourceId },
			};
		}),
	};
};
