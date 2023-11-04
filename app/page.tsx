import CardsLayout from "@/app/CardsLayout";

interface MyModel {
    uid: string;
    text: string;
    date?: Date;
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const myItemsData: MyModel[] = [
    {
        uid: "0",
        text: Math.ceil(Math.random() * 999999999999999999).toString(16),
        date: randomDate(new Date(2018, 0, 1), new Date()),
    },
    {
        uid: "1",
        text: Math.ceil(Math.random() * 999999999999999999).toString(16),
        date: randomDate(new Date(2018, 0, 1), new Date()),
    },
    {
        uid: "2",
        text: Math.ceil(Math.random() * 999999999999999999).toString(16),
    },
    { uid: "3", text: "short", date: randomDate(new Date(2018, 0, 1), new Date()) },
    {
        uid: "4",
        text: Math.ceil(Math.random() * 999999999999999999).toString(16),
        date: randomDate(new Date(2018, 0, 1), new Date()),
    },
    { uid: "5", text: "port", date: randomDate(new Date(2018, 0, 1), new Date()) },
    { uid: "6", text: "empty" },
];

export default async function Home() {
    const data = await new Promise<MyModel[]>((resolve) =>
        setTimeout(() => {
            resolve(myItemsData);
        }, 1000)
    );

    return <CardsLayout myItemsData={data} />;
}

export const metadata = {
    title: "My excellent title",
};
