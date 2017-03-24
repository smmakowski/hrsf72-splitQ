import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';
import TripSummary from './components/TripSummary.jsx';
import CreateTrip from './components/CreateTrip.jsx';
import UploadReceipt from './components/Upload.jsx';
import Profile from './components/Profile.jsx';
import Login from './components/Login.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Util from './lib/util.js';
import CreateItem from './components/CreateItem.jsx';
import $ from 'jquery';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      tripName: '',
      username: '',
      tripDesc: '',
      receiptName:'',
      items:[],
      selectItem:'',
      selectMember:'',
      members:[],
      member: '',
      memberExist: false,
      name:'',
      amount: 0
    }
    this.verifyAuthentication = this.verifyAuthentication.bind(this);
    this.handleClickLogout = this.handleClickLogout.bind(this);
    this.addItem = this.addItem.bind(this);
    this.onReceiptNameChange = this.onReceiptNameChange.bind(this);
    this.handleTripNameSubmit = this.handleTripNameSubmit.bind(this);
    this.callGVision = this.callGVision.bind(this);
    this.onGVision = this.onGVision.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.addMember = this.addMember.bind(this);
    this.memberExist = this.memberExist.bind(this);
    this.itemOnClick = this.itemOnClick.bind(this);
    this.memberOnClick = this.memberOnClick.bind(this);
    this.initialMemberSelect = this.initialMemberSelect.bind(this);
  }

  verifyAuthentication(userInfo) {
    this.setState({
      isAuthenticated: userInfo.isAuthenitcated,
      username: userInfo.name || '',
      members: userInfo.name !== undefined ? this.state.members.concat([[userInfo.name]]) : this.state.members,
      fb_id: userInfo.fb_id || ''
    });
  }

  handleClickLogout(event) {
    event.preventDefault();
    Util.logout(this.verifyAuthentication);
  }

  addItem (itemArray){
    this.setState({
      items: this.state.items.concat([[this.state.name, this.state.amount]])
    })
    this.state.name = '';
    this.state.amount = '';
  }

  onReceiptNameChange(event){
    this.setState({
      receiptName:event.target.value
    })
  }

  deleteItem(index) {
    delete this.state.items[index];
    this.setState({
      items: this.state.items
    })
  }

  callGVision(form) {
    let data = new FormData(form);
    let currentScope = this;
    $.ajax({
      type: 'POST',
      url: '/upload',
      data: data,
      processData:false,
      contentType:false,
      success: (results) => {
        console.log('.as.d.awd.as.data', results);
        console.log('this is ssss:', this, '....', currentScope);
        this.onGVision(results);
        console.log('Successfully sent post to /vision, resulting array:', this.state.items);
      },
    });
  }

   onGVision(itemizationObject) {
    //{item: price, item: price}
    let itemArray = [];
    for (var key in itemizationObject) {
      itemArray.push([key, itemizationObject[key]]);
    }
    this.setState({items: itemArray});
    console.log('Successfully sent post to /vision, resulting array:', this.state.items);
  }

  addMember (itemArray){
    this.memberExist(this.state.member,(exist) => {
        this.setState({
          memberExist: exist
        });
        if (!exist) {
          this.setState({
            members: this.state.members.concat([[this.state.member]])
          })
        }
    });

    this.state.member = '';
  }

  onInputChange(event) {
    const name = event.target.name;
    this.setState({
      [name]: event.target.value
    });
  }

  memberExist(member, cb) {
    var exist = false;
    this.state.members.forEach((val, index) => {
      exist = val[0].toUpperCase() === member.toUpperCase();
    })
    cb(exist);
  }

  handleTripNameSubmit(event) {
    console.log('Tripname was submitted:' + this.state.tripName);
    Util.sendServerTripName(this.state.tripName, this.state.tripDesc );
  }

  itemOnClick(index) {
    this.setState({
      selectItem: index
    });
  }

  initialMemberSelect() {
    if (this.state.selectMember.length === 0) {
      this.setState({
        selectMember: this.state.username
      });
    }
  }

  memberOnClick(member) {
    // const items = this.state.items;
    // let currItem = items[this.state.selectItem];
    // console.log('===========currItemB4', currItem);
    // currItem = items[this.state.selectItem].concat([[member]]);
    // console.log('===========currItemafta', currItem);
    this.setState({
      selectMember: member
    });
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/upload-receipt">Upload Receipt</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/additems">Add Items</Link></li>
              <li><Link to="/create-trip">Create Trip</Link></li>
              {this.state.isAuthenticated ? null : <li><Link to="/login">Login</Link></li>}
              {!this.state.isAuthenticated ? null : <li><Link to="/logout" onClick={this.handleClickLogout}>Logout</Link></li>}
            </ul>
            <PrivateRoute path="/" isAuthenticated={this.state.isAuthenticated} component={TripSummary}/>
            <PrivateRoute
              path="/create-trip"
              component={CreateTrip}
              isAuthenticated={this.state.isAuthenticated}
              tripName={this.state.tripName}
              onInputChange={this.onInputChange}
              handleTripNameSubmit={this.handleTripNameSubmit}
            />
            <PrivateRoute
              path ="/profile"
              isAuthenticated={this.state.isAuthenticated}
              component={Profile}
            />
            <PrivateRoute
              path ="/upload-receipt"
              isAuthenticated={this.state.isAuthenticated}
              component={UploadReceipt}
              tripName={this.state.tripName}
              tripDesc={this.state.tripDesc}
              callGVision={this.callGVision}
              onReceiptNameChange={this.onReceiptNameChange}
            />
            <PrivateRoute path="/additems" isAuthenticated={this.state.isAuthenticated} component={CreateItem}
              addItem={this.addItem}
              itemName={this.state.name}
              itemAmount={this.state.amount}
              selectItem={this.state.selectItem}
              selectMember={this.state.selectMember}
              items={this.state.items}
              deleteItem={this.deleteItem}
              members={this.state.members}
              member={this.state.member}
              memberExist={this.state.memberExist}
              addMember={this.addMember}
              initialMemberSelect={this.initialMemberSelect}
              itemOnClick={this.itemOnClick}
              memberOnClick={this.memberOnClick}
              onInputChange={this.onInputChange}/>
            <Route path ="/login" render={() => (
              this.state.isAuthenticated ? <Redirect to="/" /> : <Login />
            )}/>

          </div>
        </Router>
      </div>
    );
  }

  componentWillMount() {
    Util.verify(this.verifyAuthentication);
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
