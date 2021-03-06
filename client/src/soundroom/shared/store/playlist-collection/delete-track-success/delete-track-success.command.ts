import { PlaylistCollection } from '../../../model/playlist-collection';
import { DeleteTrackPayload } from '../delete-track/delete-track-payload';

export const deleteTrackSuccessCommand = (state: PlaylistCollection, payload: DeleteTrackPayload): PlaylistCollection => {
  // NOTE: The track is only removed from the store once we receive the TrackDeletedAction (ie. the action based on
  // socket event to all clients)

  state = Object.assign({}, state);

  const playlist = Object.assign({}, state.playlists.find(playlist => playlist._id === payload.playlist._id));
  playlist.loadState = null;
  playlist.error = null;

  state.playlists = [
    playlist,
    ...state.playlists.filter(playlist => playlist._id !== payload.playlist._id),
  ];

  return state;
};
