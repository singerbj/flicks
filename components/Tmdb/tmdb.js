import axios from 'axios';
import { getUser } from '../Firebase/firebase';
import { PAGES_TO_LOAD } from '../../utils/Constants';

const apiKey = 'eeabb975086d8c3ac3c53dfb339e5076';
const baseUrl = 'https://api.themoviedb.org/3'
let config;

const tmdbUrl = (route) => {
    return baseUrl + route.trim() + '?api_key=' + apiKey; 
};

export const getAllMedia = async (page) => {
    let getUserPromise = getUser();
    const promisesObjs = [];
    promisesObjs.push({ promise: getTrending(), media_type: 'movie', page: 0 });
    promisesObjs.push({ promise: getPopularMovies(page), media_type: 'movie', page });
    promisesObjs.push({ promise: getPopularTvShows(page), media_type: 'tv', page });

    const responses = await Promise.all(promisesObjs.map((p) => p.promise));
    let allMedia = [];
    responses.forEach((response, i) => {
        allMedia = allMedia.concat(response.data.results.map((result) => {
            result.media_type = promisesObjs[i].media_type;
            result.page = promisesObjs[i].page;
            return result;
        }));
    });

    const user = await getUserPromise;
    const uniqueUnseenAllMedia = allMedia.filter((media, i) => {
        return i === allMedia.findIndex(obj => {
            let result = obj.id === media.id;
            if(user.data() && user.data().likes){
                result = result && user.data().likes.indexOf(obj.id) < 0;
            }
            if(user.data() && user.data().dislikes){
                result = result && user.data().dislikes.indexOf(obj.id) < 0;
            }
            return result;
        });
    });

    return uniqueUnseenAllMedia;
};

export const getConfiguration = async () => {
    return await axios.get(tmdbUrl(`/configuration`));
};

export const getTrending = async (query, mediaType = 'all', timeWindow = 'week') => {
    return axios.get(tmdbUrl(`/trending/${mediaType}/${timeWindow}`));
};

export const getPopularMovies = async (page) => {
    return axios.get(tmdbUrl(`/movie/popular`) + `&page=${page}`);
};

export const getPopularTvShows = async (page) => {
    return axios.get(tmdbUrl(`/tv/popular`) + `&page=${page}`);
};

export const getImageUrl = (path) => {
    return `${config.images.base_url}/${config.images.backdrop_sizes[2]}/${path}`;
};

const init = async () => {
    try {
        const { data } = await getConfiguration();
        config = data;
    } catch (error) {
        console.log(error);
    }
};
init();