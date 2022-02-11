import {MarkdownView,Plugin, TFile} from 'obsidian';

export default class AutomaticLinks extends Plugin {

	async onload() {

		this.addRibbonIcon("links-going-out", "Backlinks", async () => {    

			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
			const noteFile = this.app.workspace.getActiveFile(); // Currently Open Note
			if(!noteFile.name) return; // Nothing Open

			const filenamesArray=await this.extractFilenameSameLevel(noteFile);

			const selectedText=editor.getSelection();
			editor.replaceSelection(filenamesArray.toString(),selectedText);

		});
	}

	onunload() {

	}

	//To Read the filenames under same level
	async extractFilenameSameLevel(noteFile: TFile):  Promise<any[]> {
	
		// Read the currently open note file. We are reading it off the HDD - we are NOT accessing the editor to do this.
		let currentName = noteFile.name; //Active File Name
		let currentPath = noteFile.path; //Path of Active File
		let activePath = currentPath;
		let currentPathSlash = currentPath.match(/\//gm).length; //Caculating no of slash from path of active file 
		let finalFilePath = new Array();
		let filePath=this.app.vault.getMarkdownFiles().map((file) => file.path) //List of all markdown files

		currentPath = currentPath.replace(currentName,"");
		currentPath = currentPath.replace("/","\/"); //Extracting the path before Active file

		var regex = new RegExp(currentPath+".*"); //Generating regex from variable

		//Extracting the filepath which comes under same level based on active file and no of /
		for (var i=0; i<filePath.length; i++) {
			if (regex.test(filePath[i])) {
				if ((currentPathSlash==filePath[i].match(/\//gm).length) && (activePath!==filePath[i])) {
					finalFilePath.push(filePath[i].toString())
				}
			}
		}

		let filenamesLinkArray=this.generateFilenamesLink(finalFilePath); //Generate md link for filenames under same path

		return filenamesLinkArray;
	}


	//Generate md link for filenames under same path
	generateFilenamesLink (filenames: any[]): any[] {

		let filenamesArray: Array<String>;
		let filenamesLinkArray = new Array();
		filenamesArray = filenames.toString().split(",");
		

		for (var i=0; i<filenamesArray.length;i++) {
			let filename: String;

			//Selecting the other filenames from file path
			let matchedPattern=(filenamesArray[i].match(/[\w-\s]+\.../g)).toString(); 
			matchedPattern=matchedPattern.replace(".md",""); //Removing .md extension

			//Constructing md links for filenames under same level
			if (i==0) {
				filename="[".concat(matchedPattern.toString())
				filename=filename.concat("](").concat(filenamesArray[i].toString().replace(/\s/g,"%20")).concat(")");
				filenamesLinkArray.push(filename.toString());
			}
			else {
				filename=" [".concat(matchedPattern.toString()).concat("](").concat(filenamesArray[i].toString().replace(/\s/g,"%20")).concat(")");
				filenamesLinkArray.push(filename.toString());
			}
		}

		filenamesLinkArray=filenamesLinkArray.sort();

		return filenamesLinkArray;
	}

}
