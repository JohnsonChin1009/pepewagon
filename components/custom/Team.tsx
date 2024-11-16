import Image from "next/image";

export default function Team() {
    return (
        <div className="flex text-center text-white space-x-10 lg:space-x-[120px] items-center justify-center">
            {data.map((item) => (
                <div key={item.id}>
                    <a href={item.link} target="_blank">
                    <Image 
                        src={item.image}
                        alt={item.image_alt}
                        width={200}
                        height={200}
                        className="rounded-full"
                    />
                    </a>
                    <div className="space-y-1 pt-3">
                        <p className="font-medium">{item.name}</p>
                        <p>{item.role}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

const data = [
    {
        id: 1,
        name: "Wan Aqil",
        role: "Visual Designer",
        image: "https://avatars.githubusercontent.com/u/73504832?v=4",
        image_alt: "Aqil's image",
        link: "https://github.com/AqilJaafree",
    },
    {
        id: 2,
        name: "0x_johnsonchin",
        role: "Frontend Developer",
        image: "https://i.seadn.io/s/raw/files/792e42acf95f77b05bed8abac5bb5148.png?auto=format&dpr=1&w=1000",
        image_alt: "Johnson's image",
        link: "https://github.com/JohnsonChin1009"
    },
];