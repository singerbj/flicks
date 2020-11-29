import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SafeView from '../components/SafeView';
import Form from '../components/Forms/Form';
import FormField from '../components/Forms/FormField';
import FormButton from '../components/Forms/FormButton';
import FormErrorMessage from '../components/Forms/FormErrorMessage';
import { hashids, getUser } from '../components/Firebase/firebase';
import Hashids from 'hashids';
import * as Yup from 'yup';
import AppButton from '../components/AppButton';

const validationSchema = Yup.object().shape({
    partnerShortcode: Yup.string()
      .required()
      .label('Partner Shortcode')
});

export default PartnerScreen = () => {
    const [ userInfo, setUserInfo ] = useState();

    const getUserInfo = async () => {
        try {
            const resp = await getUser();
            setUserInfo(resp.data());
        } catch (error) {
            console.log(error);
        }
    };

    const addPartner = () => {
        console.log('addPartner');
    };

    const removePartner = () => {
        console.log('removePartner');
    };

    useEffect(() => {
        getUserInfo();
    }, [])

    let encodedShortCode;
    if(userInfo){
        encodedShortCode = hashids.encode([userInfo.shortCode]);
    }
    return (
        <SafeView style={styles.container}>
            { !userInfo && <Text>Loading...</Text> }
            { userInfo && <>
                <Text>Your Shortcode:</Text>
                <Text style={styles.hashid}>{ encodedShortCode.substring(0, 4) + ' ' + encodedShortCode.substring(4, 8)}</Text>
            </> }
            { userInfo && !userInfo.partner && <>
                <Form
                    style={{ display: 'hidden' }}
                    initialValues={{ partnerShortcode: '' }}
                    validationSchema={validationSchema}
                    onSubmit={values => addPartner(values)}
                >
                    <FormField
                        name="partnerShortcode"
                        placeholder="Enter Partner's Shortcode"
                    />
                    <FormButton title={'Add Partner'} />
                    {/* {<FormErrorMessage error={loginError} visible={true} />} */}
                </Form>
            </> }
            { userInfo && userInfo.partner && <>
                <AppButton title={'Remove Partner'} onPress={removePartner}/>
            </> }
        </SafeView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    hashid: {
        fontSize: 30
    }
});
