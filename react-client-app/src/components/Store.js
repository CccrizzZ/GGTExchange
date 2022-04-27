import React, { Component } from 'react'
import { 
    Button, 
    Card,
} from 'react-bootstrap'
import './Box.css'

export default class Store extends Component {
    constructor(props) {
        super(props)
        
        // wallet address from parent component
        this.state = {
            AllListings: [],

        }

    }


    async componentDidMount(){

        // look for metamask
        await this.GetAllListing()
    }


    // pull all listing from contract
    GetAllListing = async () => {
        

        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.GetAllStoreListing()
        .call({
            from: this.props.WalletAddr 
        })
        console.log(result)
        // hide pop over
        this.props.HidePopup()
        
        // store to state
        this.setState({AllListings: result}) 


    }



    BuyGame = async (gid, price, e) => {
        console.log(e)


        
        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.BuyGame(gid)
        .send({
            from: this.props.WalletAddr 

            // send token to smart contract




        })
        console.log(result)


        // hide pop over
        this.props.HidePopup()
        


    }



    RenderStore = () => {
        return(
            this.state.AllListings.map((x, i) => {
                console.log(x.URI)
                return(
                    <Card style={{ width: '100%' }}>
                    <Card.Img variant="top" src={x.URI}/>
                    <Card.Body style={{backgroundColor: '#343a40'}}>
                        <Card.Title>{x.name}</Card.Title>
                        <Card.Text>
                            <hr/>
                            Description: A game about snake eating each other
                            <hr/>
                            Publisher: {x.publisher}
                            <hr/>
                            Price: {x.price} Dev
    
                        </Card.Text>
                        <Button id={x.GID} variant="primary" onClick={(e) => this.BuyGame(x.GID, x.price, e)}>Purchase</Button>
                    </Card.Body>
                </Card>
                )
            } )
        )
    }


    render() {
        return (
            <div id="modulebox">
                <h2>Store Page</h2>
                <hr />
                <div id="griddisplay">
                    {this.state.AllListings === null ? null : this.RenderStore()}
                </div>

            </div>

        )
    }
}
