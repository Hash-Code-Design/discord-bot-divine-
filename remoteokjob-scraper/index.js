const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const Model = require('../model');
let jobs
const getAllJobs = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://remoteok.io")

    await loadLatestJobs(page)
    await browser.close()
}

async function saveToDB(jobs) {
    for (let i = 0; i < jobs.length; i++) {
        const oldTitle = await Model.find({title: jobs[i].title})
        const oldCompany = await Model.findOne({company: jobs[i].company})
        if (!!oldTitle && !!oldCompany) {
            console.log('data exist')
            return;
        }
        console.log('here')
        const newJob = new Model({id: uuidv4(), title: jobs[i].title, company: jobs[i].company, technologies: jobs[i].technology, date: Date.now()})
        try {
            const dataToSave = newJob.save();
            return dataToSave;
        }
        catch (error) {
            console.log({error})
        }
        return 
    }
}

async function getPropertyValue(element, propertyName) {
    const property = await element.getProperty(propertyName);
    return await property.jsonValue();
}

function addJob(title, company, ...technologies){
    if(jobs){
        const job = { title, company, technologies};
        jobs.push(job);
    }
}

async function loadLatestJobs(page) {
    jobs = [];

    const todaysJobsBody = await page.$('tbody');
    const bodyRows = await todaysJobsBody.$$('tr');

    const rowsMapping = bodyRows.map(async (row) => {


        const jobTitleElement = await row.$('[itemprop="title"]');
        if (jobTitleElement) {
            const titleValue = await getPropertyValue(jobTitleElement, 'innerText');
            const hiringOrganization = await row.$('[itemprop=hiringOrganization]');
            let organizationName;
            let technologies = [];
            if (hiringOrganization){
                organizationName = await getPropertyValue(hiringOrganization, 'innerText');
            }
            const tags = await row.$$('.tags');
            technologies = await Promise.all(tags.map(async tag => {
                const tagContent = await tag.$('h3');
                if(tagContent){
                    return (await getPropertyValue(tagContent, 'innerText')).toLowerCase();
                }
            }));
            // removing duplicates
            technologies =  [...new Set(technologies)];
            addJob(titleValue, organizationName, ...technologies)
            saveToDB(jobs)
        }
    })
    await Promise.all(rowsMapping);
}

module.exports = { getAllJobs };