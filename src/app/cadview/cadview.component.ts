import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';
import { AngularFire, FirebaseApp , FirebaseListObservable,FirebaseObjectObservable} from 'angularfire2';
import 'rxjs/add/operator/switchMap';
import {Http, Response, ResponseContentType} from '@angular/http';
import {Observable, Subscription} from 'rxjs/Rx';
import 'rxjs/add/operator/take';

//import openJsCad form plane JavaScript
declare var OpenJsCad: any;
//import * as OpenJsCad from '../../openjscad/Viewer/openjscad-lib/openjscad';

@Component
({
  selector: 'app-cadview',
  templateUrl: './cadview.component.html',
  styleUrls: ['./cadview.component.css']
})

export class CadviewComponent implements OnInit
{
  private model_uid : string;

  public isStl = true;
  public myClass = "col-sm-12 col-md-12 col-lg-8";

  public item : FirebaseObjectObservable<any>;
  public user : FirebaseObjectObservable<any>;

  private firebase : any;

  public description: any;
  public userUid: any;

  constructor( private http: Http, private route: ActivatedRoute, private location: Location, private af: AngularFire, @Inject(FirebaseApp) fb: any)
  {
    //get reference model_uid form passed parameters
    this.route.params.map( params => params['model_uid']).subscribe((id)=>
    {
      this.model_uid = id;
    });

    this.item=af.database.object('/models/' + this.model_uid);
    this.firebase=fb;
  }

  ngOnInit()
  {
    let modelURL;
    let storageRef;

    var gProcessor = null;

    //start OpenJsCad processor
    gProcessor = new OpenJsCad.Processor(document.getElementById("viewerContext"),
                               {
                                    viewerwidth: '100%',
                                    viewerheight: '100%',
                                    drawLines: false,
                                    drawFaces: true,
                                });

    //get the item from firebase only one time
    this.item.take(1).subscribe(model=>
      {
        let modelURL = model.modelURL;
        this.description =model.description;
        this.userUid = model.uid;

        this.user=this.af.database.object(`/users/${this.userUid}`);
        this.user.take(1).subscribe(user=>
        {
          //console.log(user);
        })

        let storageRef = this.firebase.storage().refFromURL(modelURL);
        let  strStorageRef =storageRef.toString();

        //load case .jscad
        if(strStorageRef.match(/\.jscad$/i) || strStorageRef.match(/\.js$/i))
        {
          this.http.get(modelURL, {responseType: ResponseContentType.Text })
           .map(response => response.text())
           .subscribe(data =>
             {
               console.log("Loading jscad...");
               this.isStl = false;
               this.myClass = "col-sm-12 col-md-12 col-lg-8"; //make jscad Style

               gProcessor.setOpenJsCadPath('../openjscad/Viewer/openjscad-lib/');// set for library path
               gProcessor.setStatus("Processing <img id=busy src='openjscad/Viewer/imgs/busy.gif'>");
               gProcessor.setJsCad(data);
               gProcessor.viewer.handleResize(); //call handleResize otherwise it looks ugly
             });
        }
        //load case .stl -- is not workin for Binary Stl !?
        else
        {
          this.http.get(modelURL, {responseType: ResponseContentType.Text })
           .map(response => response.text())
           .subscribe(data =>
             {
               console.log("Loading other File Format...");
               this.isStl = true;
               this.myClass="col-sm-12"; //make stl Style

               gProcessor.setStatus("Converting <img id=busy src='openjscad/Viewer/imgs/busy.gif'>");
               gProcessor.setOpenJsCadPath('../openjscad/Viewer/openjscad-lib/');// set for library path
               var worker = OpenJsCad.createConversionWorker(gProcessor);

               //var u= gProcessor.baseurl+ '../openjscad/Viewer/openjscad-lib/';
               var u = 'https://johnny-5eb4e.firebaseapp.com/openjscad/Viewer/openjscad-lib/';

               //note: cache: false is set to allow evaluation of 'include' statements
               worker.postMessage({baseurl: u, source: data, filename: "*.stl", cache: false});
             });
        }
      });
    }
}
