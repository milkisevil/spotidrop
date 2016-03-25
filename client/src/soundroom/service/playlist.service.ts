import {Injectable, EventEmitter} from 'angular2/core';
import {Http, Response, RequestOptions, Headers} from 'angular2/http';

import {Observable} from 'rxjs/Observable';
import {ConnectableObservable} from 'rxjs/observable/ConnectableObservable';
import {Store} from '@ngrx/store';

import {Config} from '../model/config';
import {Playlist} from '../model/playlist';
import {PlaylistCreateBody} from "./playlist-create-body";
import {PlaylistAction} from "../model/enum/playlist-action";
import {PlaylistCreate} from "../model/playlist-create";
import {PlaylistCreateAction} from "../model/enum/playlist-create-action";
import {PlaylistCreateState} from "../model/enum/playlist-create-state";
import {PlaylistFactory} from "../model/factory/playlist.factory";

@Injectable()
export class PlaylistService {

  /**
   * An `Observable` that can be subscribed to for playlist data. Use this in components to the data of access one or
   * more playlists.
   * @deprecated
   */
  playlists:ConnectableObservable<Playlist[]>;

  /**
   * TODO refactor into it's own connection service?
   * @type {EventEmitter}
   */
  onSlowConnection:EventEmitter<boolean> = new EventEmitter();

  /**
   * Location of RESTful resource on server
   * @type {string}
   */
  private API_ENDPOINT:string = '/playlists';

  /**
   * An exponential backoff strategy is used when loading playlist data, but we won't allow that exponential delay
   * exceed this value.
   * @type {number}
   */
  private MAX_RETRY_INTERVAL:number = 30;

  /**
   * On this number of retries (within the exponential backoff strategy), we will emit our slow connection. This may be
   * communicated to the user via UI.
   * @type {number}
   */
  private SLOW_CONNECTION_RETRIES:number = 2;

  /**
   * Standard options we need to use when sending POST requests to the server
   */
  private postOptions:RequestOptions;
  private playlistCreate$:Observable<PlaylistCreate>;

  constructor( private http:Http, public store:Store<PlaylistCreate> ) {
    this.postOptions = new RequestOptions({
      headers: new Headers({'Content-Type': 'application/json'})
    });

    this.playlistCreate$ = this.store.select('playlistCreate');

    this.observeCreate();
  }

  /**
   * Starts load of the full data set.
   */
  loadAll():void {
    console.log('PlaylistService.load():', Config.API_BASE_URL + this.API_ENDPOINT);

    this.store.dispatch({type: PlaylistAction.LOAD_ALL});

    this.http.get(Config.API_BASE_URL + this.API_ENDPOINT)
      // .delay(2000)    // DEBUG: Delay for simulation purposes only
      .retryWhen(errors => this.retry(errors))
      .map(( res:Response ) => res.json())
      .subscribe(( data ) => {
        this.onSlowConnection.emit(false);

        // Add initial data to the Store
        this.store.dispatch({type: PlaylistAction.ADD, payload: data});
      }, ( error:Response ) => {
        console.error(error);

        return Observable.throw(error || 'Server error');
      });
  }

  /**
   * Loads the full data of a single playlist
   * @param id
   */
  load( id:string ):any {
    this.store.dispatch({type: PlaylistAction.LOAD, payload: id});

    this.http.get(Config.API_BASE_URL + this.API_ENDPOINT + '/' + id)
      .delay(2000)    // DEBUG: Delay for simulation purposes only
      .retryWhen(errors => this.retry(errors))
      .map(( res:Response ) => PlaylistFactory.createFromApiResponse(res.json()))
      .subscribe(( data ) => {
        this.onSlowConnection.emit(false);

        // Assign initial data to collection
        this.store.dispatch({type: PlaylistAction.ADD, payload: data});
      }, ( error:Response ) => {
        console.error(error);

        return Observable.throw(error || 'Server error');
      });
  }


  deletePlaylist( playlist:Playlist ):Observable<boolean> {
    return this.http.delete(Config.API_BASE_URL + this.API_ENDPOINT + '/' + playlist._id)
      .map(( res:Response ) => {
        console.log('PlaylistService.deletePlaylist() map: status:', res.headers.get('status'), 'splice:', playlist);

        // Delete success - reflect change in local data collection
        this.store.dispatch({type: PlaylistAction.DELETE, payload: playlist});

        return res.status === 204;
      }).catch(( error:Response ) => {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
      });
  }


  /////////////////////////
  // PRIVATE METHODS
  /////////////////////////

  /**
   * Observe changes to the `playlistCreate` store and react as appropriate.
   */
  private observeCreate() {
    this.playlistCreate$
      .filter(( playlistCreate:PlaylistCreate ) => playlistCreate.state === PlaylistCreateState.CREATING)
      .mergeMap(( playlistCreate:PlaylistCreate ) => this.create(
        playlistCreate.name,
        playlistCreate.description
      ))
      .subscribe(( newPlaylist:Playlist ) => {
        console.log('PlaylistService.initCreate: subscribe:', newPlaylist);

        // TODO: It would be amazing if we could type this payload to Playlist|Playlist[]
        // For the benefit of notifying PlaylistCreateComponent that we're successful
        this.store.dispatch({type: PlaylistCreateAction.SUCCESS, payload: newPlaylist});

        // Separate action to actually add new playlist to our collection.
        this.store.dispatch({type: PlaylistAction.ADD, payload: newPlaylist});
      }, error => this.store.dispatch({type: PlaylistCreateAction.ERROR, payload: error}));
  }

  private create( name:string, description?:string ):Observable<Playlist> {
    console.log('PlaylistCreateService.create:', name, description);

    var body:PlaylistCreateBody = {
      name: name
    };

    if (description) {
      body.description = description;
    }

    console.log('PlaylistService.create() call post:', Config.API_BASE_URL + this.API_ENDPOINT, JSON.stringify(body), this.postOptions);

    return this.http.post(Config.API_BASE_URL + this.API_ENDPOINT, JSON.stringify(body), this.postOptions)
      .map(( res:Response ) => PlaylistFactory.createFromApiResponse(res.json()))
      .catch(( error:Response ) => {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
      });
  }

  /**
   * Use with the `retryWhen()` operator for an exponential backoff retry strategy
   *
   * @example
   *
   *     Observable.retryWhen(errors => this.retry(errors))
   *
   * @param errors
   * @returns {Observable<R>}
   */
  private retry( errors:Observable<any> ):Observable<any> {
    return errors
      .mergeMap(( err, count ) => {
        // Emit event if we've retried SLOW_CONNECTION_RETRIES times
        if (count === this.SLOW_CONNECTION_RETRIES) {
          this.onSlowConnection.emit(true);
        }

        // Calc number of seconds we'll retry in using incremental backoff
        var retrySecs = Math.min(Math.round(Math.pow(++count, 2)), this.MAX_RETRY_INTERVAL);
        console.warn(`PlaylistService.load(): Retry ${count} in ${retrySecs} seconds`);

        // Set delay
        return Observable.of(err)
          .delay(retrySecs * 1000);
      });
  }
}