import { ActionReducer } from '@ngrx/store';
import { CommandReducer } from 'ngrx-command-reducer';
import { PlaylistCollection } from '../../model/playlist-collection';
import { LoadPlaylistCollectionAction } from './load-playlist-collection/load-playlist-collection.action';
import { loadPlaylistCollectionCommand } from './load-playlist-collection/load-playlist-collection.command';
import { LoadPlaylistCollectionErrorAction } from './load-playlist-collection-error/load-playlist-collection-error.action';
import { loadPlaylistCollectionErrorCommand } from './load-playlist-collection-error/load-playlist-collection-error.command';
import { LoadPlaylistCollectionSuccessAction } from './load-playlist-collection-success/load-playlist-collection-success.action';
import { loadPlaylistCollectionSuccessCommand } from './load-playlist-collection-success/load-playlist-collection-success.command';
import { DeletePlaylistAction } from './delete-playlist/delete-playlist.action';
import { deletePlaylistCommand } from './delete-playlist/delete-playlist.command';
import { DeletePlaylistErrorAction } from './delete-playlist-error/delete-playlist-error.action';
import { deletePlaylistErrorCommand } from './delete-playlist-error/delete-playlist-error.command';
import { DeletePlaylistSuccessAction } from './delete-playlist-success/delete-playlist-success.action';
import { deletePlaylistCollectionSuccessCommand } from './delete-playlist-success/delete-playlist-success.command';
import { PlaylistProgressAction } from './playlist-progress/playlist-progress.action';
import { playlistProgressCommand } from './playlist-progress/playlist-progress.command';
import { PlaylistPausedAction } from './playlist-paused/playlist-paused.action';
import { playlistPauseCommand } from './playlist-paused/playlist-paused.command';
import { PlaylistLoadAction } from './playlist-load/playlist-load.action';
import { playlistLoadCommand } from './playlist-load/playlist-load.command';
import { PlaylistLoadErrorAction } from './playlist-load-error/playlist-load-error.action';
import { AddTrackAction } from './add-track/add-track.action';
import { addTrackCommand } from './add-track/add-track.command';
import { AddTrackSuccessAction } from './add-track-success/add-track-success.action';
import { AddTrackErrorAction } from './add-track-error/add-track-error.action';
import { DeleteTrackSuccessAction } from './delete-track-success/delete-track-success.action';
import { DeleteTrackErrorAction } from './delete-track-error/delete-track-error.action';
import { DeleteTrackAction } from './delete-track/delete-track.action';
import { deleteTrackCommand } from './delete-track/delete-track.command';
import { TrackAddedAction } from './track-upsert/track-added.action';
import { TrackUpdatedAction } from './track-upsert/track-updated.action';
import { trackUpsertCommand } from './track-upsert/track-upsert.command';
import { TrackDeletedAction } from './track-deleted/track-deleted.action';
import { trackDeletedCommand } from './track-deleted/track-deleted.command';
import { PlaylistLoadSuccessAction } from './playlist-load-success/playlist-load-success.action';
import { playlistLoadSuccessCommand } from './playlist-load-success/playlist-load-success.command';
import { playlistCollectionCommand } from './playlist-collection.command';
import { deleteTrackErrorCommand } from './delete-track-error/delete-track-error.command';
import { deleteTrackSuccessCommand } from './delete-track-success/delete-track-success.command';
import { playlistLoadErrorCommand } from './playlist-load-error/playlist-load-error.command';
import { addTrackSuccessCommand } from './add-track-success/add-track-success.command';
import { addTrackErrorCommand } from './add-track-error/add-track-error.command';

const DEFAULT_STATE: PlaylistCollection = {
  loadState: null,
  playlists: [],
  active: null,
  recentAction: null,
  error: null,
};

export const playlistCollectionReducer: ActionReducer<PlaylistCollection> = new CommandReducer<PlaylistCollection>(DEFAULT_STATE)
  .all(playlistCollectionCommand, true)
  .add(LoadPlaylistCollectionAction, loadPlaylistCollectionCommand)
  .add(LoadPlaylistCollectionSuccessAction, loadPlaylistCollectionSuccessCommand)
  .add(LoadPlaylistCollectionErrorAction, loadPlaylistCollectionErrorCommand)

  .add(DeletePlaylistAction, deletePlaylistCommand)
  .add(DeletePlaylistSuccessAction, deletePlaylistCollectionSuccessCommand)
  .add(DeletePlaylistErrorAction, deletePlaylistErrorCommand)

  .add(PlaylistProgressAction, playlistProgressCommand)
  .add(PlaylistPausedAction, playlistPauseCommand)

  .add(PlaylistLoadAction, playlistLoadCommand)
  .add(PlaylistLoadSuccessAction, playlistLoadSuccessCommand)
  .add(PlaylistLoadErrorAction, playlistLoadErrorCommand)

  .add(AddTrackAction, addTrackCommand)
  .add(AddTrackSuccessAction, addTrackSuccessCommand)
  .add(AddTrackErrorAction, addTrackErrorCommand)

  .add(DeleteTrackAction, deleteTrackCommand)
  .add(DeleteTrackSuccessAction, deleteTrackSuccessCommand)
  .add(DeleteTrackErrorAction, deleteTrackErrorCommand)

  .add(TrackAddedAction, trackUpsertCommand)
  .add(TrackUpdatedAction, trackUpsertCommand)
  .add(TrackDeletedAction, trackDeletedCommand)
  .reducer();
