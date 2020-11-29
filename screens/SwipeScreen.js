import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, Linking, ScrollView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Button from '../components/AppButton';
import { MAX_PAGES_TO_LOAD } from '../utils/Constants';

import useStatusBar from '../hooks/useStatusBar';
import { likeMedia, dislikeMedia } from '../components/Firebase/firebase';
import SafeView from '../components/SafeView';
import colors from '../utils/colors';

import { getImageUrl, getAllMedia } from '../components/Tmdb/tmdb';
const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;


export default SwipeScreen = () => {
    useStatusBar('dark-content');
    console.ignoredYellowBox = ['Setting a timer'];

    const [ media, setMedia ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ pageToLoad, setPageToLoad ] = useState(1);

    const mediaTypes = {
        movie: "Movie",
        tv: "TV Show"
    };

    const getMedia = async (page) => {
        let result = [];
        try {
            setLoading(true);
            result = await getAllMedia(page);
            console.log("page: " + page);
            if(result.length === 0 && page < MAX_PAGES_TO_LOAD){
                result = await getMedia(page + 1);
            } else {
                setMedia(result);
                setPageToLoad(page);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
        return result;
    };

    useEffect(() => {
        getMedia(pageToLoad);
    }, [])

    return (
        <SafeView style={(loading || !loading && media.length === 0) ? styles.containerLoading : styles.container}>
            { loading && <Text style={styles.loading}>Loading...</Text> }
            { !loading && media.length === 0 && (
                <>
                    <Text style={styles.loading}>No media left to swipe on :(</Text>
                    <Text style={styles.loading}>Check back later!</Text>
                </>
            )}
            { !loading && media.length > 0 &&
                <Swiper
                    backgroundColor={colors.ghostWhite}
                    useViewOverflow={false}
                    cards={media}
                    cardStyle={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        width: 'auto',
                        height: 'auto',
                        marginTop: 20,
                        marginLeft: 20,
                        marginRight: 20,
                        marginBottom: -20
                    }}
                    renderCard={(card) => {
                        if(card){
                            let overview = card.overview;
                            const maxDescriptionLength = 325;
                            if(overview.length > maxDescriptionLength){
                                let overviewArray = card.overview.split('\n')[0].substring(0, maxDescriptionLength).split(' ');
                                overviewArray = overviewArray.slice(0, overviewArray.length - 2);
                                let lastWord = overviewArray[overviewArray.length - 1];
                                if(lastWord.substring(lastWord.length - 1, lastWord.length).match(regex)){
                                    lastWord = lastWord.substring(0, lastWord.length - 1);
                                    overviewArray[overviewArray.length - 1] = lastWord;
                                }
                                overview = overviewArray.join(' ') + "...";
                            }
                            return (
                                <View style={styles.card}>
                                    <Image source={{uri: getImageUrl(card.backdrop_path)}} style={styles.image} imageStyle={{ borderRadius: 20 }} />
                                    <View style={styles.bottom}>
                                        <View style={styles.fadedBackground}>
                                            <Text style={styles.title}>{card.original_title || card.original_name}</Text>
                                            <Text style={styles.subtitle}>{mediaTypes[card.media_type] || card.media_type} - {card.vote_average} / 10</Text>
                                            <Text style={styles.overview}>{ overview }</Text>
                                            <Button title="More Info" onPress={() => Linking.openURL(`https://www.themoviedb.org/${card.media_type}/${card.id}`)}/>
                                        </View>
                                    </View>
                                </View>
                            )
                        } else {
                            return (
                                <View style={styles.card}>
                                </View>
                            )
                        }
                    }}
                    verticalSwipe={false}
                    onSwipedLeft={(cardIndex) => {
                        dislikeMedia(media[cardIndex].id);
                    }}
                    onSwipedRight={(cardIndex) => {
                        likeMedia(media[cardIndex].id);
                    }}
                    onSwipedAll={() => {
                        getMedia(pageToLoad);
                    }}
                    cardIndex={0}
                    stackSize={2}
                >
                </Swiper>
            }
        </SafeView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    containerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    card: {
        flex: 1,
        borderRadius: 20,
        borderColor: colors.white,
        justifyContent: 'center',
        backgroundColor: colors.white,
        marginBottom: 60,
        flexDirection: 'column',
        elevation: 5
    },
    loading: {
        textAlign: 'center'
    },
    title: {
        fontSize: 30,
        backgroundColor: 'transparent',
        color: colors.white,
    },
    subtitle: {
        fontSize: 18,
        backgroundColor: 'transparent',
        marginBottom: 10,
        color: colors.white,
    },
    overview: {
        flex: 1,
        fontSize: 18,
        backgroundColor: 'transparent',
        color: colors.white,
    },
    done: {
        textAlign: 'center',
        fontSize: 30,
        color: colors.white,
        backgroundColor: 'transparent'
    },
    bottom: {
        flex: 1,
    },
    fadedBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    },
    image: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: "center",
    },
  })
