/**
 * ❌ DEPRECATED FILE - DO NOT USE
 *
 * This hooks file is DUPLICATE of ../store/hooks.ts
 *
 * Import from:
 * ```
 * import { useAppDispatch, useAppSelector } from '../store/hooks'
 * ```
 *
 * DO NOT import from this file.
 */

import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store/index";

// DEPRECATED - USE ../store/hooks.ts INSTEAD
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
