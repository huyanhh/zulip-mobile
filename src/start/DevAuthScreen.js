import React from 'react';
import {
  ScrollView,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import { Auth } from '../types';
import boundActions from '../boundActions';
import styles from '../common/styles';
import { ErrorMsg, Screen, ZulipButton } from '../common';
import { devGetEmails, devFetchApiKey } from '../api';
import { getAuth } from '../account/accountSelectors';

type State = {
  progress: boolean,
  directAdmins: string[],
  directUsers: string[],
}

class DevAuthScreen extends React.Component {

  props: {
    auth: Auth,
  };

  state: State = {
    progress: false,
    directAdmins: [],
    directUsers: [],
  };

  componentWillMount = async () => {
    const { auth } = this.props;

    this.setState({ progress: true, error: undefined });

    try {
      const [directAdmins, directUsers] = await devGetEmails(auth);

      this.setState({ directAdmins, directUsers, progress: false });
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ progress: false });
    }
  }

  tryDevLogin = async (email: string) => {
    const { auth } = this.props;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await devFetchApiKey(auth, email);
      this.props.loginSuccess(auth.realm, email, apiKey);
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { directAdmins, directUsers, error } = this.state;

    return (
      <Screen title="Pick a dev account">
        <ScrollView>
          <View style={styles.container}>
            {error && <ErrorMsg error={error} />}
            <Text style={[styles.field, styles.heading2]}>
              Administrators
            </Text>
            {directAdmins.map((email) =>
              <ZulipButton
                key={email}
                text={email}
                onPress={() => this.tryDevLogin(email)}
              />
            )}
            <Text style={[styles.field, styles.heading2]}>
              Normal users
            </Text>
            {directUsers.map((email) =>
              <ZulipButton
                key={email}
                text={email}
                secondary
                onPress={() => this.tryDevLogin(email)}
              />
            )}
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
  }),
  boundActions,
)(DevAuthScreen);
