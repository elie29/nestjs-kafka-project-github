import { State, Store } from '@elie29/store';

export interface BasicState extends State {
  data?: string;
  connected: boolean;
}

export const INITIAL_STATE: BasicState = {
  data: undefined,
  connected: false,
};

export class BasicStore extends Store<BasicState> {
  constructor() {
    super(INITIAL_STATE, { logChanges: true });
  }
}
